import express from "express";
import {
  getAdminAnalytics,
  getOwnerAnalytics,
  getRoleBasedAnalytics,
} from "./analytics.controller";
import { adminOnly, authenticated, ownerOnly, userOnly } from "../middleware/bearAuth";
import { getUserAnalytics } from "./user.analytics.controller";

export const analyticsRouter = express.Router();

// Admin-only route
analyticsRouter.get(
  "/analytics/admin",authenticated, adminOnly,
  getAdminAnalytics
);

// Owner-only route
analyticsRouter.get(
  "/analytics/owner",authenticated, ownerOnly,
  getOwnerAnalytics
);

// User route
analyticsRouter.get(
  "/analytics/user/:userId",authenticated, userOnly, 
  getUserAnalytics
);

// Smart route that auto-detects role
analyticsRouter.get(
  "/analytics",authenticated,
  getRoleBasedAnalytics
);
