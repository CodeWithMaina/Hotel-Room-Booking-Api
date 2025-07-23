import express from "express";
import { handleSubscribe, handleUnsubscribe } from "./newsletter.controller";

export const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", handleSubscribe);

newsletterRouter.post("/unsubscribe", handleUnsubscribe);