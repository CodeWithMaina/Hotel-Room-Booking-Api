import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Ensure env vars are loaded

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  FRONTEND_URL,
  NODE_ENV,
} = process.env;

if (!STRIPE_SECRET_KEY) throw new Error("❌ STRIPE_SECRET_KEY is missing");
if (!STRIPE_WEBHOOK_SECRET) throw new Error("❌ STRIPE_WEBHOOK_SECRET is missing");

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});

export const config = {
  FRONTEND_URL: FRONTEND_URL || "http://localhost:5173",
  NODE_ENV: NODE_ENV || "development",
  STRIPE: {
    SECRET_KEY: STRIPE_SECRET_KEY,
    WEBHOOK_SECRET: STRIPE_WEBHOOK_SECRET,
    API_VERSION: "2025-06-30.basil",
  },
};
