
import { eq, count, sum, sql, and, lte, desc } from "drizzle-orm";
import { bookings, customerSupportTickets, hotels, payments, rooms, users } from "../drizzle/schema";
import db from "../drizzle/db";
import { gte } from "drizzle-orm";

export const getAnalyticsSummary = async () => {
  const [totalRevenueResult] = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.paymentStatus, "Completed"));

  const [totalUsersResult] = await db
    .select({ count: count() })
    .from(users);

  const [totalBookingsResult] = await db
    .select({ count: count() })
    .from(bookings);

  const [openTicketsResult] = await db
    .select({ count: count() })
    .from(customerSupportTickets)
    .where(eq(customerSupportTickets.status, "Open"));

  const monthlySpending = await db.execute(sql`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
      SUM(amount)::float AS total
    FROM ${payments}
    WHERE "paymentStatus" = 'Completed'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12;
  `);

  const monthlyBookingFrequency = await db.execute(sql`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
      COUNT(*) AS count
    FROM ${bookings}
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12;
  `);

  return {
    totalRevenue: Number(totalRevenueResult?.total || 0),
    totalUsers: Number(totalUsersResult?.count || 0),
    totalBookings: Number(totalBookingsResult?.count || 0),
    openTickets: Number(openTicketsResult?.count || 0),
    monthlySpending: monthlySpending.rows,
    monthlyBookingFrequency: monthlyBookingFrequency.rows,
  };
};



/**
 * Dashboard Statistics Service
 */
export const getDashboardStatsService = async () => {
  const [usersCount, bookingsCount, hotelsCount] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(bookings),
    db.select({ count: count() }).from(hotels),
  ]);

  // Calculate revenue (sum of completed payments)
  const revenueResult = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.paymentStatus, 'Completed'));

  return {
    totalUsers: usersCount[0].count,
    totalBookings: bookingsCount[0].count,
    totalHotels: hotelsCount[0].count,
    totalRevenue: revenueResult[0].total || 0,
  };
};

/**
 * Monthly Bookings Data Service
 */
export const getMonthlyBookingsDataService = async () => {
  const currentYear = new Date().getFullYear();
  
  return await db.execute(sql`
    SELECT 
      TO_CHAR("createdAt", 'Mon') as month,
      COUNT(*) as bookings
    FROM bookings
    WHERE EXTRACT(YEAR FROM "createdAt") = ${currentYear}
    GROUP BY month, EXTRACT(MONTH FROM "createdAt")
    ORDER BY EXTRACT(MONTH FROM "createdAt")
  `);
};

/**
 * Room Occupancy Data Service
 */
export const getRoomOccupancyDataService = async () => {
  const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  const [totalRooms, occupiedRooms] = await Promise.all([
    db.select({ count: count() }).from(rooms),
    db.select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingStatus, 'Confirmed'),
          lte(bookings.checkInDate, today),
          gte(bookings.checkOutDate, today)
        )
      ),
  ]);

  return {
    available: totalRooms[0].count - occupiedRooms[0].count,
    occupied: occupiedRooms[0].count,
  };
};

/**
 * Recent Bookings Service
 */
export const getRecentBookingsService = async (limit = 5) => {
  const results = await db.query.bookings.findMany({
    limit,
    orderBy: desc(bookings.createdAt),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
      room: {
        columns: {
          roomType: true,
        },
      },
    },
  });

  return results.map(booking => ({
    id: booking.bookingId,
    guest: `${booking.user?.firstName} ${booking.user?.lastName}`,
    room: booking.room?.roomType,
    date: booking.createdAt?.toISOString().split('T')[0],
  }));
};

/**
 * New Users Service
 */
export const getNewUsersService = async (limit = 5) => {
  const results = await db.query.users.findMany({
    limit,
    orderBy: desc(users.createdAt),
    columns: {
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
    },
  });

  return results.map(user => ({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    joined: user.createdAt?.toISOString().split('T')[0],
  }));
};

/**
 * System Health Service (mock data)
 */
export const getSystemHealthService = async () => {
  // In a real application, you would check actual system metrics
  return {
    uptime: "99.98%",
    securityStatus: "Secure",
    serverLoad: "Stable",
  };
};

/**
 * Combined Dashboard Data Service
 */
export const getFullDashboardDataService = async () => {
  try {
    const [
      stats,
      monthlyBookings,
      roomOccupancy,
      recentBookings,
      newUsers,
      systemHealth
    ] = await Promise.all([
      getDashboardStatsService(),
      getMonthlyBookingsDataService(),
      getRoomOccupancyDataService(),
      getRecentBookingsService(),
      getNewUsersService(),
      getSystemHealthService(),
    ]);

    return {
      success: true,
      data: {
        stats,
        charts: {
          monthlyBookings,
          roomOccupancy,
        },
        recentActivity: {
          recentBookings,
          newUsers,
        },
        systemHealth,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard data",
    };
  }
};