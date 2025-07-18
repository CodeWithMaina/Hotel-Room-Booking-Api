import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
   apiVersion: "2023-08-16",
   typescript: true,
});


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const config = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    API_VERSION: '2023-08-16',
  },
  NODE_ENV: process.env.NODE_ENV || 'development',
};