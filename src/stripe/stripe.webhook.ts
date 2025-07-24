import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe";
import { payments } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import {
  createPaymentService,
  updatePaymentByTransactionIdService,
} from "../payment/payment.service";
import { updateBookingService } from "../booking/booking.service";

export const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    res.status(400).send("Missing Stripe signature or webhook secret");
    return;
  }

  let event: Stripe.Event;

  try {
    // Parse raw body buffer
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.warn(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`❌ Error processing event: ${event.type}`, err.message);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// ---------------------------------------
// Handlers
// ---------------------------------------

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  console.log(`🔄 Handling checkout.session.completed for session: ${session.id}`);

  try {
    const bookingId = session.metadata?.bookingId;
    const paymentIntentId = session.payment_intent as string;

    if (!bookingId || !paymentIntentId) {
      throw new Error("Missing bookingId or payment_intent in session");
    }

    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) throw new Error("Invalid bookingId");

    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, paymentIntentId),
    });

    if (existingPayment) {
      console.log(`ℹ️ Payment already exists for bookingId ${bookingIdNum}`);
      return;
    }

    const paymentStatus = session.payment_status === "paid" ? "Completed" : "Pending";

    await createPaymentService({
      bookingId: bookingIdNum,
      amount: String(session.amount_total ? session.amount_total / 100 : 0),
      transactionId: paymentIntentId,
      paymentMethod: "card",
      paymentStatus,
    });

    console.log(`✅ Created payment record for bookingId ${bookingIdNum}`);
  } catch (err) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", err);
    throw err;
  }
};

const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  console.log(`🔄 Handling payment_intent.succeeded for: ${paymentIntent.id}`);

  try {
    const transactionId = paymentIntent.id;

    let payment;
    let retries = 3;

    while (retries--) {
      payment = await db.query.payments.findFirst({
        where: eq(payments.transactionId, transactionId),
      });

      if (payment) break;

      console.log(`🔄 Waiting for payment record to be created (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!payment) throw new Error(`No payment found for transactionId: ${transactionId}`);

    await updatePaymentByTransactionIdService(transactionId, {
      paymentStatus: "Completed",
    });

    if (payment.bookingId != null) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Confirmed",
      });
      console.log(`✅ Booking confirmed for bookingId ${payment.bookingId}`);
    } else {
      console.warn(`⚠️ Payment ${transactionId} has no associated bookingId`);
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentSucceeded:", err);
    throw err;
  }
};

const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  console.log(`🔄 Handling payment_intent.payment_failed for: ${paymentIntent.id}`);

  try {
    const transactionId = paymentIntent.id;

    const payment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, transactionId),
    });

    if (!payment) {
      console.error(`❌ No payment found for failed intent: ${transactionId}`);
      return;
    }

    await updatePaymentByTransactionIdService(transactionId, {
      paymentStatus: "Failed",
    });

    if (payment.bookingId != null) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Cancelled",
      });
      console.log(`❌ Booking cancelled for bookingId ${payment.bookingId}`);
    } else {
      console.error("❌ No associated bookingId for failed payment");
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentFailed:", err);
  }
};
