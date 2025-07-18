import { Request, Response } from "express";
import { getAnalyticsSummary, getFullDashboardDataService } from "./analytics.service";

export const getSummaryController = async (_req: Request, res: Response) => {
  try {
    const summary = await getAnalyticsSummary();
     res.status(200).json(summary);
     return;
  } catch (error) {
    console.error("Analytics summary error:", error);
     res.status(500).json({ error: "Failed to load analytics data." });
     return
  }
};
export const getDashboardData = async (req: Request, res: Response) => {
  const dashboardData = await getFullDashboardDataService();
  
  if (!dashboardData.success) {
     res.status(500).json(dashboardData);
     return;
  }
  
  res.json(dashboardData);
};