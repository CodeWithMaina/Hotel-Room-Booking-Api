import { Request, Response } from "express";
import {
  confirmEmailInSubscription,
  subscribeEmail,
  unsubscribeEmail,
} from "./newsletter.service";

export const handleSubscribe = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ message: "A valid email is required." });
    return;
  }

  const result = await subscribeEmail(email);

  switch (result) {
    case "subscribed":
      res
        .status(201)
        .json({ message: "Successfully subscribed to newsletter." });
      return;
    case "already-subscribed":
      res.status(200).json({ message: "Email is already subscribed." });
      return;
    case "error":
    default:
      res.status(500).json({ message: "An error occurred while subscribing." });
      return;
  }
};

export const handleUnsubscribe = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ message: "A valid email is required." });
    return;
  }

  const existing = await confirmEmailInSubscription(email);
  if (!existing) {
    res.status(404).json({ message: "Email not found in subscription list." });
    return;
  }

  const success = await unsubscribeEmail(email);
  if (success) {
    res
      .status(200)
      .json({ message: "Successfully unsubscribed from newsletter." });
    return;
  } else {
    res.status(500).json({ message: "Unsubscribe failed. Try again later." });
    return;
  }
};
