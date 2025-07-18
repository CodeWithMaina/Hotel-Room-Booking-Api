import { Request, Response } from "express";
import { config, stripe } from "./stripe";
import { bookings } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { amount, bookingId } = req.body;

    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
       res.status(400).json({ error: 'Invalid amount provided' });
       return;
    }

    if (!bookingId || isNaN(bookingId)) {
       res.status(400).json({ error: 'Invalid booking ID' });
       return;
    }

    // Verify booking exists
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.bookingId, parseInt(bookingId))
    });

    if (!booking) {
       res.status(404).json({ error: 'Booking not found' });
       return;
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: 'Booking Payment',
              description: `Booking #${bookingId}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: String(bookingId),
      },
      success_url: `${config.FRONTEND_URL}/user/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.FRONTEND_URL}/user/payment/payment-cancelled`,
    });

     res.status(200).json({ 
      url: session.url, 
      sessionId: session.id 
    });
    return;
    
  } catch (err: any) {
    console.error('Stripe error:', err);
     res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
    return;
  }
};