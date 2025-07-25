import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe";
import db from "../drizzle/db";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createPaymentService,
  updatePaymentByTransactionIdService,
} from "../payment/payment.service";
import {
  getBookingByIdService,
  updateBookingService,
} from "../booking/booking.service";
import { sendBookingEmail } from "./paymentEmailingConfirmation";

export const webhookHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("🔥 Incoming Stripe webhook");

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("❌ Missing Stripe signature or webhook secret");
    res.status(400).send("Missing Stripe signature or secret");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error("❌ Stripe webhook signature verification failed:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      default:
        console.warn(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`❌ Error processing event (${event.type}):`, err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// 🧠 HANDLERS BELOW

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  console.log(`🔄 Handling checkout.session.completed: ${session.id}`);

  try {
    const bookingId = session.metadata?.bookingId;
    const userEmail = session.customer_email as string;
    const paymentIntentId = session.payment_intent as string;

    if (!bookingId || !paymentIntentId) {
      throw new Error(
        "Missing bookingId or payment_intent in metadata/session"
      );
    }

    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) throw new Error("Invalid bookingId in metadata");

    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, paymentIntentId),
    });

    if (existingPayment) {
      console.log(`ℹ️ Payment already exists for bookingId ${bookingIdNum}`);
      return;
    }

    const paymentStatus =
      session.payment_status === "paid" ? "Completed" : "Pending";

    await createPaymentService({
      bookingId: bookingIdNum,
      amount: String(session.amount_total ? session.amount_total / 100 : 0),
      transactionId: paymentIntentId,
      paymentMethod: "card",
      paymentStatus,
    });

    await sendBookingEmail("BOOKING_PAYMENT_SUCCESS", "success", {
      bookingId: bookingIdNum,
      amount: Number(session.amount_total ? session.amount_total / 100 : 0),
      transactionId: paymentIntentId,
    });

    console.log(
      `✅ Payment recorded for bookingId ${bookingIdNum}, status: ${paymentStatus}`
    );
  } catch (err) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", err);
    throw err;
  }
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  console.log(`🔄 Handling payment_intent.succeeded: ${paymentIntent.id}`);

  try {
    const transactionId = paymentIntent.id;
    if (!transactionId) throw new Error("Missing paymentIntent ID");

    let retries = 3;
    let payment;

    while (retries-- > 0) {
      payment = await db.query.payments.findFirst({
        where: eq(payments.transactionId, transactionId),
      });

      if (payment) break;

      console.log(`⏳ Waiting for payment record... (${retries} retries left)`);
      await new Promise((res) => setTimeout(res, 1000));
    }

    if (!payment) throw new Error("No payment record found after retries");

    await updatePaymentByTransactionIdService(transactionId, {
      paymentStatus: "Completed",
    });

    if (payment.bookingId) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Confirmed",
      });

      await sendBookingEmail("BOOKING_CONFIRMED", "confirmation", {
        bookingId: payment.bookingId,
        transactionId: payment.transactionId ?? "",
      });

      console.log(`✅ Booking confirmed for bookingId ${payment.bookingId}`);
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentSucceeded:", err);
    throw err;
  }
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  console.log(`❌ Handling payment_intent.payment_failed: ${paymentIntent.id}`);

  try {
    const transactionId = paymentIntent.id;
    const payment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, transactionId),
    });

    if (!payment) {
      console.warn("⚠️ No payment record found for failed transaction");
      return;
    }

    if (payment.transactionId) {
      await updatePaymentByTransactionIdService(payment.transactionId, {
        paymentStatus: "Failed",
      });
    }

    if (payment.bookingId) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Cancelled",
      });

      await sendBookingEmail("BOOKING_PAYMENT_FAILED", "failure", {
        bookingId: payment.bookingId,
        transactionId: payment.transactionId ?? "",
      });

      console.log(`❌ Booking cancelled for bookingId ${payment.bookingId}`);
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentFailed:", err);
  }
};
