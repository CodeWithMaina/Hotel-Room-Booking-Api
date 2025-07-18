import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe";
import { updatePaymentByTransactionIdService } from "../payment/payment.service";
import db from "../drizzle/db";
import { bookings, payments, TPaymentInsert } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig || !endpointSecret) {
     res.status(400).json({ error: "Missing signature or endpoint secret" });
     return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Invalid webhook signature:", err.message);
     res.status(400).json({ error: "Invalid signature" });
     return;

  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.async_payment_succeeded":
        await handleAsyncPaymentSucceeded(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failure:", err);
    res.status(500).json({ error: "Webhook processing error" });
  }
};

// ------------------------
// 🔁 Idempotent Processing
// ------------------------

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  const transactionId = session.payment_intent as string;
  const amountTotal = session.amount_total;

  if (!bookingId || !transactionId || !amountTotal) {
    throw new Error("Missing bookingId, transactionId or amount");
  }

  const paymentStatus = getPaymentStatus(session.payment_status);
  const amount = (amountTotal / 100).toFixed(2);

  // Idempotency check
  const existing = await db.query.payments.findFirst({
    where: eq(payments.transactionId, transactionId),
  });

  if (existing) {
    console.log(`ℹ️ Duplicate payment ignored: ${transactionId}`);
    return;
  }

  const paymentData: TPaymentInsert = {
    bookingId: parseInt(bookingId),
    transactionId,
    amount,
    paymentStatus,
    paymentMethod: "card",
    paymentDate: paymentStatus === "Completed" ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.transaction(async (tx) => {
    if (paymentStatus === "Completed") {
      await tx.update(bookings)
        .set({ bookingStatus: "Confirmed", updatedAt: new Date() })
        .where(eq(bookings.bookingId, parseInt(bookingId)));
    }

    const [inserted] = await tx.insert(payments).values(paymentData).returning();

    if (!inserted) {
      throw new Error("Payment insert failed");
    }

    console.log(`✅ Payment recorded: ${inserted.paymentId}`);
  });
}

async function handleAsyncPaymentSucceeded(session: Stripe.Checkout.Session) {
  const transactionId = session.payment_intent as string;
  if (!transactionId) return;

  await updatePaymentByTransactionIdService(transactionId, {
    paymentStatus: "Completed",
    paymentDate: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✅ Payment succeeded: ${transactionId}`);
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session) {
  const transactionId = session.payment_intent as string;
  if (!transactionId) return;

  await updatePaymentByTransactionIdService(transactionId, {
    paymentStatus: "Failed",
    updatedAt: new Date(),
  });

  console.log(`❌ Payment failed: ${transactionId}`);
}

function getPaymentStatus(status: string): "Pending" | "Completed" | "Failed" {
  switch (status) {
    case "paid": return "Completed";
    case "unpaid":
    case "failed": return "Failed";
    default: return "Pending";
  }
}
