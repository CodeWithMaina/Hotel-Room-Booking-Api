// auth.middleware.ts
import { NextFunction, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { userRoleEnum } from "../drizzle/schema";

type UserRole = (typeof userRoleEnum.enumValues)[number];

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        userType: UserRole;
        firstName: string;
        lastName: string;
      };
    }
  }
}

/**
 * Main authentication middleware
 */
export const authenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  console.log("Received token:", token); // Debug log

  if (!token) {
    console.log("No token found in headers"); // Debug log
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      email: string;
      userType: UserRole;
      firstName: string;
      lastName: string;
      exp: number;
    };

    if (Date.now() >= decoded.exp * 1000) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = <T extends UserRole>(
  ...roles: T[]
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.userType as T)) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource",
      });
      return;
    }

    next();
  };
};

// Specific role middlewares
export const adminOnly = authorizeRoles("admin");
export const ownerOnly = authorizeRoles("owner");
export const userOnly = authorizeRoles("user");
export const ownerOrAdmin = authorizeRoles("owner", "admin");

export const authenticated = authenticate;
