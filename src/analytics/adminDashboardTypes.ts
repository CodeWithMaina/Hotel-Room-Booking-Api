// src/types/adminDashboardTypes.ts

// Base response type
type TBaseResponse = {
  success: boolean;
  message: string;
  error?: string;
};

// Dashboard Stats

export type TAdminDashboardStats = {
  totalUsers: number;
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalReviews: number;
  latestUsers: TLatestUser[]; // Add this
};

export type TAdminDashboardStatsResponse = TBaseResponse & {
  data?: TAdminDashboardStats;
};

// Booking Trends
export type TBookingTrendData = {
  date: string;
  bookings: number;
  revenue: number;
};

export type TBookingTrendResponse = TBaseResponse & {
  data?: TBookingTrendData[];
};

// Revenue Data
export type TRevenueData = {
  date: string;
  amount: number;
  transactions: number;
};

export type TRevenueDataResponse = TBaseResponse & {
  data?: TRevenueData[];
};

// User Growth
export type TUserGrowthData = {
  date: string;
  total: number;
  owners: number;
  admins: number;
  regularUsers: number;
};

export type TUserGrowthResponse = TBaseResponse & {
  data?: TUserGrowthData[];
};

// Pie Chart (Booking Status Distribution)
export type TPieChartData = {
  status: string;
  count: number;
};

export type TPieChartDataResponse = TBaseResponse & {
  data?: TPieChartData[];
};

// Hotel Revenue
export type THotelRevenueData = {
  hotelId: number;
  name: string;
  revenue: number;
};

export type THotelRevenueResponse = TBaseResponse & {
  data?: THotelRevenueData[];
};

// Success response helper types (optional but recommended)
export type TSuccessResponse<T> = TBaseResponse & {
  success: true;
  data: T;
};

export type TErrorResponse = TBaseResponse & {
  success: false;
  error: string;
};

// Example usage of success/error types (optional)
export type TAdminDashboardStatsSuccessResponse = TSuccessResponse<TAdminDashboardStats>;
export type TAdminDashboardStatsErrorResponse = TErrorResponse;

// Add these to adminDashboardTypes.ts

// Monthly Bookings
export type TMonthlyBookingsData = {
  month: string;
  bookings: number;
};

export type TMonthlyBookingsResponse = TBaseResponse & {
  data?: TMonthlyBookingsData[];
};

// Monthly Revenue
export type TMonthlyRevenueData = {
  month: string;
  revenue: number;
};

export type TMonthlyRevenueResponse = TBaseResponse & {
  data?: TMonthlyRevenueData[];
};

// Latest Users
export type TLatestUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  profileImage?: string | null;
};

export type TLatestUsersResponse = TBaseResponse & {
  data?: TLatestUser[];
};

export type TAllDashboardData = {
  stats: TAdminDashboardStats;
  bookingTrends: TBookingTrendData[];
  revenueData: TRevenueData[];
  userGrowth: TUserGrowthData[];
  bookingStatusDistribution: TPieChartData[];
  revenueByHotel: THotelRevenueData[];
  monthlyBookings: TMonthlyBookingsData[];
  monthlyRevenue: TMonthlyRevenueData[];
  latestUsers: TLatestUser[];
};

export type TAllDashboardDataResponse = TBaseResponse & {
  data?: TAllDashboardData;
};