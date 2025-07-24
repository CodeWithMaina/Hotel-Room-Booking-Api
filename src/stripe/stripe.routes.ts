import express from "express";
import { createCheckoutSession } from "./stripe.controller";

export const stripeRouter = express.Router();

// Use JSON body parser for standard API calls
stripeRouter.post(
  "/create-checkout-session",
  express.json(),
  createCheckoutSession
);