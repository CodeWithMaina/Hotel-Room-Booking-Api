import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userRoleEnum } from "../drizzle/schema";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

type DecodedToken = {
  userId: number;
  email: string;
  role: typeof userRoleEnum.enumValues[number];
  firstName: string;
  lastName: string;
  exp: number;
};

// AUTHENTICATION MIDDLEWARE
export const verifyToken = async (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
};

// AUTHORIZATION MIDDLEWARE
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  requiredRole?: typeof userRoleEnum.enumValues[number]
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const decodedToken = await verifyToken(token, process.env.JWT_SECRET as string);
  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // If no specific role required, just verify token and continue
  if (!requiredRole) {
    req.user = decodedToken;
    return next();
  }

  // Check if user has required role
  if (decodedToken.role === requiredRole) {
    req.user = decodedToken;
    return next();
  }

  return res
    .status(403)
    .json({ error: "Forbidden: You do not have permission to access this resource" });
};

// Role-specific middleware
export const adminAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, "admin");

export const userAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, "user");

export const ownerAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, "user");

// General authentication - no specific role required
export const optionalAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next);