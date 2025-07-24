import express from "express";
import { webhookHandler } from "./stripe.webhook";
import { createCheckoutSession } from "./stripe.controller";

export const stripeRouter = express.Router();

// Stripe webhook needs raw body for signature verification
stripeRouter.post(
  "/webhook",
  // Important: No other middleware before this!
  express.raw({ type: "application/json" }),
  webhookHandler
);

// Use JSON body parser for standard API calls
stripeRouter.post(
  "/create-checkout-session",
  express.json(),
  createCheckoutSession
);