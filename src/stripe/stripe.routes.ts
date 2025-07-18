import express from "express";
import { webhookHandler } from "./stripe.webhook";
import { createCheckoutSession } from "./stripe.controller";

export const stripeRouter = express.Router();

// Stripe webhook needs raw body for signature verification
stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw body parser only for webhook
  webhookHandler
);

// Use JSON body parser only for standard API calls
stripeRouter.post(
  "/create-checkout-session",
  express.json(),
  createCheckoutSession
);
