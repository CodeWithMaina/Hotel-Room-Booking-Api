import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe"; // your Stripe instance
import dotenv from "dotenv";
import db from "../drizzle/db";
import { bookings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendNotificationEmail } from "../middleware/googleMailer";

dotenv.config();

export const webhookHandler = async (req: Request, res: Response) => {
  console.log("🔥 Stripe webhook received");

  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Stripe webhook signature verification failed:", err);
     res.status(400).send(`Webhook Error: ${(err as Error).message}`);
     return;
  }

  // Handle the event types you expect
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Checkout session completed:", session.id);

      const bookingId = session.metadata?.bookingId;
      const userEmail = session.customer_details?.email;

      if (!bookingId) {
        console.error("⚠️ Missing bookingId in session metadata");
         res.status(400).send("Missing bookingId");
         return;
      }

      try {
        const updatedBooking = await db
          .update(bookings)
          .set({ bookingStatus: "Confirmed" })
          .where(eq(bookings.bookingId, parseInt(bookingId)))
          .returning();

        console.log("✅ Booking updated:", updatedBooking);

        // if (userEmail) {
        //   await sendNotificationEmail({
        //     to: userEmail,
        //     subject: "Booking Confirmed",
        //     html: `<p>Your payment was successful and your booking #${bookingId} is confirmed!</p>`,
        //   });

        //   console.log("📧 Confirmation email sent to", userEmail);
        // }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error("❌ Failed to update booking:", err);
         res.status(500).send("Internal server error");
         return;
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      // const userEmail = intent?.receipt_email || intent?.charges?.data?.[0]?.billing_details?.email;

      console.log("⚠️ Payment failed:", intent.id);

      // if (userEmail) {
      //   await sendNotificationEmail({
      //     to: userEmail,
      //     subject: "Payment Failed",
      //     html: `<p>Your payment failed. Please try again or use a different payment method.</p>`,
      //   });

      //   console.log("📧 Failure email sent to", userEmail);
      // }

      res.status(200).json({ received: true });
      break;
    }

    default:
      console.warn("🚫 Unhandled event type:", event.type);
      res.status(200).send("Unhandled event type");
  }
};
