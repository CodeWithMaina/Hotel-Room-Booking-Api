import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  // ❗ Skip Stripe webhook to preserve raw body buffer
  if (req.originalUrl === "/api/webhook") return next();

  console.log(`${req.method} ${req.originalUrl}`);
  next();
};
