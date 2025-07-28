// // src/controllers/adminDashboard.controller.ts
// import { Request, Response } from "express";
// import {
//   getAdminDashboardStatsService,
//   getBookingTrendsService,
//   getRevenueDataService,
//   getUserGrowthService,
//   getBookingStatusDistributionService,
//   getRevenueByHotelService,
//   getLatestUsersService,
//   getMonthlyRevenueService,
//   getMonthlyBookingsService,
//   getAllDashboardDataService,
// } from "./adminDashboard.service";
// import {
//   TAdminDashboardStatsResponse,
//   TBookingTrendResponse,
//   TRevenueDataResponse,
//   TUserGrowthResponse,
//   TPieChartDataResponse,
//   THotelRevenueResponse,
//   TSuccessResponse,
//   TErrorResponse,
//   TAdminDashboardStats,
//   TBookingTrendData,
//   TRevenueData,
//   TUserGrowthData,
//   TPieChartData,
//   THotelRevenueData,
//   TLatestUsersResponse,
//   TLatestUser,
//   TMonthlyRevenueResponse,
//   TMonthlyRevenueData,
//   TMonthlyBookingsResponse,
//   TMonthlyBookingsData,
//   TAllDashboardDataResponse,
//   TAllDashboardData
// } from "./adminDashboardTypes";

// // Helper function for consistent error responses
// const createErrorResponse = (error: unknown, defaultMessage: string): TErrorResponse => ({
//   success: false,
//   message: defaultMessage,
//   error: error instanceof Error ? error.message : "Unknown error"
// });

// export const getAdminDashboardStats = async (
//   req: Request,
//   res: Response<TAdminDashboardStatsResponse>
// ) => {
//   try {
//     const stats = await getAdminDashboardStatsService();
//     const response: TSuccessResponse<TAdminDashboardStats> = {
//       success: true,
//       message: "Dashboard stats fetched successfully",
//       data: stats
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch dashboard stats"));
//   }
// };

// export const getBookingTrends = async (
//   req: Request,
//   res: Response<TBookingTrendResponse>
// ) => {
//   try {
//     const data = await getBookingTrendsService(); // No days parameter
//     const response: TSuccessResponse<TBookingTrendData[]> = {
//       success: true,
//       message: "Booking trends fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch booking trends"));
//   }
// };

// export const getRevenueData = async (
//   req: Request,
//   res: Response<TRevenueDataResponse>
// ) => {
//   try {
//     const data = await getRevenueDataService(); // No days parameter
//     const response: TSuccessResponse<TRevenueData[]> = {
//       success: true,
//       message: "Revenue data fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch revenue data"));
//   }
// };

// export const getUserGrowth = async (
//   req: Request,
//   res: Response<TUserGrowthResponse>
// ) => {
//   try {
//     const data = await getUserGrowthService(); // No days parameter
//     const response: TSuccessResponse<TUserGrowthData[]> = {
//       success: true,
//       message: "User growth data fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch user growth data"));
//   }
// };

// export const getBookingStatusDistribution = async (
//   req: Request,
//   res: Response<TPieChartDataResponse>
// ) => {
//   try {
//     const data = await getBookingStatusDistributionService();
//     const response: TSuccessResponse<TPieChartData[]> = {
//       success: true,
//       message: "Booking status distribution fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch booking status distribution"));
//   }
// };

// // Add these new controllers to adminDashboard.controller.ts

// export const getMonthlyBookings = async (
//   req: Request,
//   res: Response<TMonthlyBookingsResponse>
// ) => {
//   try {
//     const data = await getMonthlyBookingsService();
//     const response: TSuccessResponse<TMonthlyBookingsData[]> = {
//       success: true,
//       message: "Monthly bookings data fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch monthly bookings data"));
//   }
// };

// export const getMonthlyRevenue = async (
//   req: Request,
//   res: Response<TMonthlyRevenueResponse>
// ) => {
//   try {
//     const data = await getMonthlyRevenueService();
//     const response: TSuccessResponse<TMonthlyRevenueData[]> = {
//       success: true,
//       message: "Monthly revenue data fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch monthly revenue data"));
//   }
// };

// export const getLatestUsers = async (
//   req: Request,
//   res: Response<TLatestUsersResponse>
// ) => {
//   try {
//     const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
//     const data = await getLatestUsersService(limit);
//     const response: TSuccessResponse<TLatestUser[]> = {
//       success: true,
//       message: "Latest users fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch latest users"));
//   }
// };

// export const getRevenueByHotel = async (
//   req: Request,
//   res: Response<THotelRevenueResponse>
// ) => {
//   try {
//     const data = await getRevenueByHotelService();
//     const response: TSuccessResponse<THotelRevenueData[]> = {
//       success: true,
//       message: "Revenue by hotel fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch revenue by hotel"));
//   }
// };

// export const getAllDashboardData = async (
//   req: Request,
//   res: Response<TAllDashboardDataResponse>
// ) => {
//   try {
//     const data = await getAllDashboardDataService(); // No days parameter
//     const response: TSuccessResponse<TAllDashboardData> = {
//       success: true,
//       message: "All dashboard data fetched successfully",
//       data
//     };
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json(createErrorResponse(error, "Failed to fetch dashboard data"));
//   }
// };