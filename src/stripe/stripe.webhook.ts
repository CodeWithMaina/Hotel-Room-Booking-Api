// stripe.webhook.ts
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

export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not configured");
     res.status(500).send("Server configuration error");
     return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
     res.status(400).send(`Webhook Error: ${err.message}`);
     return;
  }

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

    case "charge.succeeded":
      console.log(`✅ Charge succeeded: ${event.data.object.id}`);
      break;

    case "charge.failed":
      console.log(`❌ Charge failed: ${event.data.object.id}`);
      break;

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// ---------------------------------------
// Handlers
// ---------------------------------------

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  try {
    const bookingId = session.metadata?.bookingId;
    const paymentIntentId = session.payment_intent as string;

    if (!bookingId || !paymentIntentId) {
      console.error("❌ Missing bookingId or payment_intent in session metadata");
      return;
    }

    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      console.error("❌ Invalid bookingId in session metadata");
      return;
    }

    // Check if payment record already exists
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, paymentIntentId),
    });

    if (!existingPayment) {
      await createPaymentService({
        bookingId: bookingIdNum,
        amount: String(session.amount_total),
        transactionId: paymentIntentId,
        paymentMethod: "card",
        paymentStatus: "Pending",
      });
      console.log(`✅ Created payment record for bookingId ${bookingIdNum}`);
    } else {
      console.log(`ℹ️ Payment already exists for bookingId ${bookingIdNum}`);
    }
  } catch (err) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", err);
  }
};

const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const transactionId = paymentIntent.id;

    const payment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, transactionId),
    });

    if (!payment) {
      console.error(`❌ No payment record found for transactionId: ${transactionId}`);
      return;
    }

    if (payment.transactionId != null) {
      await updatePaymentByTransactionIdService(payment.transactionId, {
        paymentStatus: "Completed",
      });
    } else {
      console.error("❌ Cannot update payment: transactionId is null or undefined");
    }

    if (payment.bookingId != null) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Confirmed",
      });
      console.log(`✅ Payment confirmed and booking updated for bookingId ${payment.bookingId}`);
    } else {
      console.error("❌ Cannot update booking: bookingId is null or undefined");
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentSucceeded:", err);
  }
};

const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const transactionId = paymentIntent.id;

    const payment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, transactionId),
    });

    if (!payment) {
      console.error(`❌ No payment record found for failed paymentIntent: ${transactionId}`);
      return;
    }

    if (payment.transactionId != null) {
      await updatePaymentByTransactionIdService(payment.transactionId, {
        paymentStatus: "Failed",
      });
    } else {
      console.error("❌ Cannot update payment: transactionId is null or undefined");
    }

    if (payment.bookingId != null) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Cancelled",
      });
      console.log(`❌ Payment failed. Booking cancelled for bookingId ${payment.bookingId}`);
    } else {
      console.error("❌ Cannot update booking: bookingId is null or undefined");
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentFailed:", err);
  }
};
