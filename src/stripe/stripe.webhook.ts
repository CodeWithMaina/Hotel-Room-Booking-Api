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

export const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
     res.status(400).send("Missing Stripe signature or secret");
     return;
  }

  let event: Stripe.Event;

  try {
    // req.body is a Buffer because of express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
     res.status(400).send(`Webhook Error: ${err.message}`);
     return;
  }

  // Process event
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
        console.warn(`Unhandled event type: ${event.type}`);
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

    if (!bookingId) {
      throw new Error("Missing bookingId in session metadata");
    }
    if (!paymentIntentId) {
      throw new Error("Missing payment_intent in session");
    }

    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error(`Invalid bookingId in metadata: ${bookingId}`);
    }

    // Check if payment record already exists
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.transactionId, paymentIntentId),
    });

    if (existingPayment) {
      console.log(`ℹ️ Payment already exists for bookingId ${bookingIdNum}`);
      return;
    }

    // Create payment with initial status based on payment status from Stripe
    const paymentStatus = session.payment_status === 'paid' ? 'Completed' : 'Pending';
    
    await createPaymentService({
      bookingId: bookingIdNum,
      amount: String(session.amount_total ? session.amount_total / 100 : 0),
      transactionId: paymentIntentId,
      paymentMethod: "card",
      paymentStatus: paymentStatus,
    });

    console.log(`✅ Created payment record for bookingId ${bookingIdNum} with status ${paymentStatus}`);
  } catch (err) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", err);
    throw err; // Re-throw to ensure it's logged by the main handler
  }
};

const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  console.log(`🔄 Handling payment_intent.succeeded for: ${paymentIntent.id}`);
  
  try {
    const transactionId = paymentIntent.id;
    if (!transactionId) {
      throw new Error("PaymentIntent ID is missing");
    }

    // Add retry logic for race condition
    let payment;
    let retries = 3;
    
    while (retries > 0) {
      payment = await db.query.payments.findFirst({
        where: eq(payments.transactionId, transactionId),
      });
      
      if (payment) break;
      
      console.log(`🔄 Waiting for payment record to be created (${retries} retries left)`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!payment) {
      throw new Error(`No payment record found for transactionId: ${transactionId}`);
    }

    await updatePaymentByTransactionIdService(transactionId, {
      paymentStatus: "Completed",
    });

    if (payment.bookingId != null) {
      await updateBookingService(payment.bookingId, {
        bookingStatus: "Confirmed",
      });
      console.log(`✅ Payment confirmed and booking updated for bookingId ${payment.bookingId}`);
    } else {
      console.warn(`⚠️ Payment ${transactionId} has no associated bookingId`);
    }
  } catch (err) {
    console.error("❌ Error in handlePaymentIntentSucceeded:", err);
    throw err;
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
