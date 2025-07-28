import { Request, Response } from "express";
import { getUserAnalyticsService } from "./user.analytics.service";

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    // Validate user ID
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
       res.status(400).json({ 
        success: false,
        error: "Invalid user ID" 
      });
      return
    }

    // Get analytics
    const analytics = await getUserAnalyticsService(userId);
    
    // Successful response
     res.json({
      success: true,
      data: analytics
    });
    return;

  } catch (error: any) {
    // Handle specific error types
    if (error.message === 'User not found') {
       res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    // Handle unexpected errors
    console.error('Error in getUserAnalytics:', error);
     res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching user analytics'
    });
    return;
  }
};