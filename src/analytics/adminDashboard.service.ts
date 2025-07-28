// // src/services/adminDashboard.service.ts
// import { and, count, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
// import db from "../drizzle/db";
// import {
//   bookings,
//   hotels,
//   payments,
//   reviews,
//   rooms,
//   users,
// } from "../drizzle/schema";
// import { TAdminDashboardStats, TAllDashboardData, TBookingTrendData, TLatestUser, TMonthlyBookingsData, TMonthlyRevenueData, TRevenueData, TUserGrowthData } from "./adminDashboardTypes";


// export const getAdminDashboardStatsService = async (): Promise<TAdminDashboardStats> => {
//   // Get all counts in parallel
//   const [
//     usersCount,
//     hotelsCount,
//     roomsCount,
//     bookingsCount,
//     activeBookingsCount,
//     revenueResult,
//     reviewsCount,
//     latestUsers
//   ] = await Promise.all([
//     db.select({ count: count() }).from(users),
//     db.select({ count: count() }).from(hotels),
//     db.select({ count: count() }).from(rooms),
//     db.select({ count: count() }).from(bookings),
//     db
//       .select({ count: count() })
//       .from(bookings)
//       .where(
//         and(
//           ne(bookings.bookingStatus, "Cancelled"),
//           lte(bookings.checkInDate, sql`CURRENT_DATE`),
//           gte(bookings.checkOutDate, sql`CURRENT_DATE`)
//         )
//       ),
//     db
//       .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
//       .from(payments)
//       .where(eq(payments.paymentStatus, "Completed")),
//     db.select({ count: count() }).from(reviews),
//     getLatestUsersService()
//   ]);

//   return {
//     totalUsers: usersCount[0].count,
//     totalHotels: hotelsCount[0].count,
//     totalRooms: roomsCount[0].count,
//     totalBookings: bookingsCount[0].count,
//     activeBookings: activeBookingsCount[0].count,
//     totalRevenue: Number(revenueResult[0].total) || 0,
//     totalReviews: reviewsCount[0].count,
//     latestUsers,
//   };
// };

// export const getBookingTrendsService = async (): Promise<TBookingTrendData[]> => {
//   const results = await db.execute<{
//     date: string;
//     count: string;
//     revenue: string;
//   }>(sql`
//     SELECT 
//       DATE(${bookings.createdAt}) AS date,
//       COUNT(*) AS count,
//       SUM(${bookings.totalAmount}) AS revenue
//     FROM ${bookings}
//     GROUP BY DATE(${bookings.createdAt})
//     ORDER BY DATE(${bookings.createdAt}) ASC
//   `);

//   return results.rows.map((row) => ({
//     date: row.date,
//     bookings: Number(row.count),
//     revenue: Number(row.revenue) || 0,
//   }));
// };

// export const getRevenueDataService = async (): Promise<TRevenueData[]> => {
//   const results = await db.execute<{
//     date: string;
//     amount: string;
//     transactions: string;
//   }>(sql`
//     SELECT 
//       DATE(${payments.paymentDate}) AS date,
//       SUM(${payments.amount}) AS amount,
//       COUNT(*) AS transactions
//     FROM ${payments}
//     WHERE ${payments.paymentStatus} = 'Completed'
//     GROUP BY DATE(${payments.paymentDate})
//     ORDER BY DATE(${payments.paymentDate}) ASC
//   `);

//   return results.rows.map((row) => ({
//     date: row.date,
//     amount: Number(row.amount) || 0,
//     transactions: Number(row.transactions),
//   }));
// };

// export const getUserGrowthService = async (): Promise<TUserGrowthData[]> => {
//   const results = await db.execute<{
//     date: string;
//     count: string;
//     owners: string;
//     admins: string;
//     regular_users: string;
//   }>(sql`
//     SELECT 
//       DATE(${users.createdAt}) AS date,
//       COUNT(*) AS count,
//       SUM(CASE WHEN ${users.role} = 'owner' THEN 1 ELSE 0 END) AS owners,
//       SUM(CASE WHEN ${users.role} = 'admin' THEN 1 ELSE 0 END) AS admins,
//       SUM(CASE WHEN ${users.role} = 'user' THEN 1 ELSE 0 END) AS regular_users
//     FROM ${users}
//     GROUP BY DATE(${users.createdAt})
//     ORDER BY DATE(${users.createdAt}) ASC
//   `);

//   return results.rows.map((row) => ({
//     date: row.date,
//     total: Number(row.count),
//     owners: Number(row.owners),
//     admins: Number(row.admins),
//     regularUsers: Number(row.regular_users),
//   }));
// };

// export const getBookingStatusDistributionService = async (): Promise<
//   { status: string; count: number }[]
// > => {
//   const results = await db
//     .select({
//       status: bookings.bookingStatus,
//       count: count(),
//     })
//     .from(bookings)
//     .groupBy(bookings.bookingStatus);

//   return results.map((row) => ({
//     status: row.status,
//     count: row.count,
//   }));
// };

// export const getRevenueByHotelService = async (): Promise<
//   { hotelId: number; name: string; revenue: number }[]
// > => {
//   const results = await db.execute<{
//     hotelId: number;
//     name: string;
//     revenue: string;
//   }>(sql`
//     SELECT 
//       h.hotel_id AS "hotelId",
//       h.name,
//       COALESCE(SUM(p.amount), 0) AS revenue
//     FROM ${hotels} h
//     LEFT JOIN ${rooms} r ON h.hotel_id = r.hotel_id
//     LEFT JOIN ${bookings} b ON r.room_id = b.room_id
//     LEFT JOIN ${payments} p ON b.booking_id = p.booking_id AND p.payment_status = 'Completed'
//     GROUP BY h.hotel_id, h.name
//     ORDER BY revenue DESC
//     LIMIT 10
//   `);

//   return results.rows.map((row) => ({
//     hotelId: row.hotelId,
//     name: row.name,
//     revenue: Number(row.revenue) || 0,
//   }));
// };

// export const getMonthlyBookingsService = async (): Promise<TMonthlyBookingsData[]> => {
//   const results = await db.execute<{
//     month: string;
//     bookings: string;
//   }>(sql`
//     SELECT 
//       TO_CHAR(${bookings.createdAt}, 'YYYY-MM') AS month,
//       COUNT(*) AS bookings
//     FROM ${bookings}
//     WHERE ${bookings.createdAt} >= CURRENT_DATE - INTERVAL '1 year'
//     GROUP BY TO_CHAR(${bookings.createdAt}, 'YYYY-MM')
//     ORDER BY month ASC
//   `);

//   return results.rows.map((row) => ({
//     month: row.month,
//     bookings: Number(row.bookings),
//   }));
// };

// export const getMonthlyRevenueService = async (): Promise<TMonthlyRevenueData[]> => {
//   const results = await db.execute<{
//     month: string;
//     revenue: string;
//   }>(sql`
//     SELECT 
//       TO_CHAR(${payments.paymentDate}, 'YYYY-MM') AS month,
//       COALESCE(SUM(${payments.amount}), 0) AS revenue
//     FROM ${payments}
//     WHERE 
//       ${payments.paymentStatus} = 'Completed' AND
//       ${payments.paymentDate} >= CURRENT_DATE - INTERVAL '1 year'
//     GROUP BY TO_CHAR(${payments.paymentDate}, 'YYYY-MM')
//     ORDER BY month ASC
//   `);

//   return results.rows.map((row) => ({
//     month: row.month,
//     revenue: Number(row.revenue) || 0,
//   }));
// };

// export const getLatestUsersService = async (limit: number = 3): Promise<TLatestUser[]> => {
//   const results = await db.query.users.findMany({
//     columns: {
//       userId: true,
//       firstName: true,
//       lastName: true,
//       email: true,
//       profileImage: true,
//       createdAt: true,
//     },
//     orderBy: desc(users.createdAt),
//     limit,
//     where: ne(users.createdAt, null),
//   });

//   return results.map(user => ({
//     ...user,
//     createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
//   }));
// };

// export const getAllDashboardDataService = async (): Promise<TAllDashboardData> => {
//   const [
//     stats,
//     bookingTrends,
//     revenueData,
//     userGrowth,
//     bookingStatusDistribution,
//     revenueByHotel,
//     monthlyBookings,
//     monthlyRevenue,
//     latestUsers
//   ] = await Promise.all([
//     getAdminDashboardStatsService(),
//     getBookingTrendsService(), // No days parameter
//     getRevenueDataService(),   // No days parameter
//     getUserGrowthService(),    // No days parameter
//     getBookingStatusDistributionService(),
//     getRevenueByHotelService(),
//     getMonthlyBookingsService(),
//     getMonthlyRevenueService(),
//     getLatestUsersService()
//   ]);

//   return {
//     stats,
//     bookingTrends,
//     revenueData,
//     userGrowth,
//     bookingStatusDistribution,
//     revenueByHotel,
//     monthlyBookings,
//     monthlyRevenue,
//     latestUsers
//   };
// };