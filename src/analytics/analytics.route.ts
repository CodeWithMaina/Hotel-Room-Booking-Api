import { Router } from "express";
import { getDashboardData, getSummaryController } from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.get("/user/analytics/summary", getSummaryController);
analyticsRouter.get("/admin/analytics/summary", getDashboardData);
