// analytics.controller.ts
import { Request, Response } from "express";
import {
  getAdminDashboardStats,
  getOwnerDashboardStats,
  getUserDashboardStats,
  TRole,
} from "./analytics.service";
import { DateRange } from "./analytics.service";

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const dateRange = req.query as unknown as DateRange;
    const result = await getAdminDashboardStats(dateRange);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
       res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const dateRange = req.query as unknown as DateRange;
    const result = await getOwnerDashboardStats(userId, dateRange);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
       res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const dateRange = req.query as unknown as DateRange;
    const result = await getUserDashboardStats(userId, dateRange);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoleBasedAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.userType as TRole; // Cast to TRole type

    if (!userId || !role) {
       res.status(401).json({
        success: false,
        message: "Unauthorized - Missing user ID or role",
      });
      return;
    }

    // Parse and validate date range
    let dateRange: DateRange | undefined;
    if (req.query.startDate || req.query.endDate) {
      // Ensure both dates are provided if either exists
      if (!req.query.startDate || !req.query.endDate) {
         res.status(400).json({
          success: false,
          message: "Both startDate and endDate are required when providing date range",
        });
        return;
      }

      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      // Validate dates
      if (isNaN(startDate.getTime())) {
         res.status(400).json({
          success: false,
          message: "Invalid startDate format",
        });
        return;
      }

      if (isNaN(endDate.getTime())) {
         res.status(400).json({
          success: false,
          message: "Invalid endDate format",
        });
        return;
      }

      if (startDate > endDate) {
         res.status(400).json({
          success: false,
          message: "startDate must be before endDate",
        });
        return;
      }

      dateRange = { startDate, endDate };
    }

    // Get analytics based on role
    let result;
    switch (role) {
      case "admin":
        result = await getAdminDashboardStats(dateRange);
        break;
      case "owner":
        result = await getOwnerDashboardStats(userId, dateRange);
        break;
      case "user":
        result = await getUserDashboardStats(userId, dateRange);
        break;
      default:
         res.status(403).json({
          success: false,
          message: "Forbidden - Invalid user role",
        });
        return;
    }

    // Return the result with appropriate status code
     res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result.data,
      message: result.message || `Successfully retrieved ${role} analytics`,
    });
    return;

  } catch (error: any) {
    console.error("Error in getRoleBasedAnalytics:", error);
     res.status(500).json({
      success: false,
      message: error.message || "Internal server error while fetching analytics",
    });
    return;
  }
};