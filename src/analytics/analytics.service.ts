import db from "../drizzle/db";
import {
  and,
  asc,
  between,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  ne,
  sql,
  sum,
} from "drizzle-orm";
import {
  bookings,
  customerSupportTickets,
  hotels,
  payments,
  reviews,
  rooms,
  users,
  userRoleEnum,
  roomTypes,
  wishlist,
} from "../drizzle/schema";

export type TRole = "user" | "owner" | "admin";

// ====================== COMMON TYPES ======================
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ====================== COMMON ANALYTICS FUNCTIONS ======================

/**
 * Formats a date to YYYY-MM-DD string
 */
const formatDate = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Validates date range and throws error if invalid
 */
const validateDateRange = (dateRange: DateRange) => {
  if (dateRange.startDate > dateRange.endDate) {
    throw new Error("Start date must be before end date");
  }
};

// ====================== ADMIN ANALYTICS ======================

interface AdminDashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: any[];
  pendingTickets: number;
  userGrowth: { date: string; count: number }[];
  revenueTrends: { date: string; amount: number }[];
}

export const getAdminDashboardStats = async (
  dateRange?: Partial<DateRange>
): Promise<AnalyticsResponse<AdminDashboardStats>> => {
  try {
    // Default to last 30 days if no date range provided
    const now = new Date();
    const defaultStartDate = new Date(0);

    // Handle partial or missing date range
    const range = {
      startDate: dateRange?.startDate || defaultStartDate,
      endDate: dateRange?.endDate || now,
    };

    validateDateRange(range);

    // Get all stats in parallel
    const [
      totalUsersResult,
      totalHotelsResult,
      totalBookingsResult,
      totalRevenueResult,
      recentBookingsResult,
      pendingTicketsResult,
      userGrowthResult,
      revenueTrendsResult,
    ] = await Promise.all([
      // Total users count
      db.select({ count: count() }).from(users),

      // Total hotels count
      db.select({ count: count() }).from(hotels),

      // Total bookings count (within date range)
      db
        .select({ count: count() })
        .from(bookings)
        .where(between(bookings.createdAt, range.startDate, range.endDate)),

      // Total revenue (completed payments within date range)
      db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(
          and(
            eq(payments.paymentStatus, "Completed"),
            between(payments.paymentDate, range.startDate, range.endDate)
          )
        ),

      // Recent 5 bookings
      db.query.bookings.findMany({
        limit: 5,
        orderBy: desc(bookings.createdAt),
        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          room: {
            columns: {
              roomId: true,
              pricePerNight: true,
            },
            with: {
              hotel: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // Pending support tickets
      db
        .select({ count: count() })
        .from(customerSupportTickets)
        .where(eq(customerSupportTickets.status, "Open")),

      // User growth over time (grouped by day)
      db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count(),
        })
        .from(users)
        .where(between(users.createdAt, range.startDate, range.endDate))
        .groupBy(sql`DATE(${users.createdAt})`),

      // Revenue trends (grouped by day)
      db
        .select({
          date: sql<string>`DATE(${payments.paymentDate})`,
          amount: sum(payments.amount),
        })
        .from(payments)
        .where(
          and(
            eq(payments.paymentStatus, "Completed"),
            between(payments.paymentDate, range.startDate, range.endDate)
          )
        )
        .groupBy(sql`DATE(${payments.paymentDate})`),
    ]);

    return {
      success: true,
      data: {
        totalUsers: totalUsersResult[0]?.count || 0,
        totalHotels: totalHotelsResult[0]?.count || 0,
        totalBookings: totalBookingsResult[0]?.count || 0,
        totalRevenue: Number(totalRevenueResult[0]?.total || 0),
        recentBookings: recentBookingsResult,
        pendingTickets: pendingTicketsResult[0]?.count || 0,
        userGrowth: userGrowthResult.map((row) => ({
          date: row.date,
          count: row.count,
        })),
        revenueTrends: revenueTrendsResult.map((row) => ({
          date: row.date,
          amount: Number(row.amount || 0),
        })),
      },
    };
  } catch (error: any) {
    console.error("Error in getAdminDashboardStats:", error);
    return {
      success: false,
      data: {} as AdminDashboardStats,
      message: error.message,
    };
  }
};

// ====================== HOTEL OWNER ANALYTICS ======================

interface OwnerDashboardStats {
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageRating: number;
  recentBookings: any[];
  upcomingCheckIns: any[];
  revenueByRoomType: { roomType: string; revenue: number }[];
  bookingTrends: { date: string; count: number }[];
}

export const getOwnerDashboardStats = async (
  ownerId: number,
  dateRange?: DateRange
): Promise<AnalyticsResponse<OwnerDashboardStats>> => {
  try {
    // Verify the user is an owner
    const owner = await db.query.users.findFirst({
      where: and(eq(users.userId, ownerId), eq(users.role, "owner")),
    });

    if (!owner) {
      throw new Error("User not found or not an owner");
    }

    // Default to last 30 days if no date range provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), 0, 1);

    const range = {
      startDate: dateRange?.startDate || defaultStartDate,
      endDate: dateRange?.endDate || now,
    };

    validateDateRange(range);

    // First, fetch hotels owned by the owner
    const hotelsResult = await db.query.hotels.findMany({
      where: eq(hotels.ownerId, ownerId),
      columns: {
        hotelId: true,
      },
    });

    const hotelIds = hotelsResult.map((h) => h.hotelId);

    if (hotelIds.length === 0) {
      return {
        success: true,
        data: {
          totalRooms: 0,
          availableRooms: 0,
          totalBookings: 0,
          totalRevenue: 0,
          occupancyRate: 0,
          averageRating: 0,
          recentBookings: [],
          upcomingCheckIns: [],
          revenueByRoomType: [],
          bookingTrends: [],
        },
      };
    }

    // Get all stats in parallel
    const [
      totalRoomsResult,
      availableRoomsResult,
      totalBookingsResult,
      totalRevenueResult,
      averageRatingResult,
      recentBookingsResult,
      upcomingCheckInsResult,
      revenueByRoomTypeResult,
      bookingTrendsResult,
    ] = await Promise.all([
      // Total rooms count across all owner's hotels
      db
        .select({ count: count() })
        .from(rooms)
        .where(inArray(rooms.hotelId, hotelIds)),

      // Available rooms count
      db
        .select({ count: count() })
        .from(rooms)
        .where(
          and(inArray(rooms.hotelId, hotelIds), eq(rooms.isAvailable, true))
        ),

      // Total bookings count (within date range)
      db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            inArray(
              bookings.roomId,
              db
                .select({ roomId: rooms.roomId })
                .from(rooms)
                .where(inArray(rooms.hotelId, hotelIds))
            ),
            between(bookings.createdAt, range.startDate, range.endDate)
          )
        ),

      // Total revenue (completed payments within date range)
      db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(
          and(
            eq(payments.paymentStatus, "Completed"),
            inArray(
              payments.bookingId,
              db
                .select({ bookingId: bookings.bookingId })
                .from(bookings)
                .where(
                  inArray(
                    bookings.roomId,
                    db
                      .select({ roomId: rooms.roomId })
                      .from(rooms)
                      .where(inArray(rooms.hotelId, hotelIds))
                  )
                )
            ),
            between(payments.paymentDate, range.startDate, range.endDate)
          )
        ),

      // Average rating for all hotels
      db
        .select({ avg: sql<number>`AVG(${reviews.rating})` })
        .from(reviews)
        .where(inArray(reviews.hotelId, hotelIds)),

      // Recent 5 bookings
      db.query.bookings.findMany({
        limit: 5,
        orderBy: desc(bookings.createdAt),
        where: inArray(
          bookings.roomId,
          db
            .select({ roomId: rooms.roomId })
            .from(rooms)
            .where(inArray(rooms.hotelId, hotelIds))
        ),
        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          room: {
            columns: {
              roomId: true,
              pricePerNight: true,
            },
            with: {
              hotel: {
                columns: {
                  name: true,
                },
              },
              roomType: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // Upcoming check-ins (next 7 days)
      db.query.bookings.findMany({
        where: and(
          inArray(
            bookings.roomId,
            db
              .select({ roomId: rooms.roomId })
              .from(rooms)
              .where(inArray(rooms.hotelId, hotelIds))
          ),
          between(
            bookings.checkInDate,
            formatDate(new Date()),
            formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
          ),
          eq(bookings.bookingStatus, "Confirmed")
        ),
        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
              contactPhone: true,
            },
          },
          room: {
            columns: {
              roomId: true,
            },
            with: {
              hotel: {
                columns: {
                  name: true,
                },
              },
              roomType: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // Revenue by room type
      db
        .select({
          roomType: roomTypes.name,
          revenue: sql<number>`SUM(${payments.amount})`,
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
        .innerJoin(rooms, eq(bookings.roomId, rooms.roomId))
        .innerJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.roomTypeId))
        .where(
          and(
            eq(payments.paymentStatus, "Completed"),
            inArray(rooms.hotelId, hotelIds),
            between(payments.paymentDate, range.startDate, range.endDate)
          )
        )
        .groupBy(roomTypes.name),

      // Booking trends (grouped by day)
      db
        .select({
          date: sql<string>`DATE(${bookings.createdAt})`,
          count: count(),
        })
        .from(bookings)
        .where(
          and(
            inArray(
              bookings.roomId,
              db
                .select({ roomId: rooms.roomId })
                .from(rooms)
                .where(inArray(rooms.hotelId, hotelIds))
            ),
            between(bookings.createdAt, range.startDate, range.endDate)
          )
        )
        .groupBy(sql`DATE(${bookings.createdAt})`),
    ]);

    const totalRooms = totalRoomsResult[0]?.count || 0;
    const availableRooms = availableRoomsResult[0]?.count || 0;
    const occupancyRate =
      totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0;

    return {
      success: true,
      data: {
        totalRooms,
        availableRooms,
        totalBookings: totalBookingsResult[0]?.count || 0,
        totalRevenue: Number(totalRevenueResult[0]?.total || 0),
        occupancyRate,
        averageRating: Number(averageRatingResult[0]?.avg || 0),
        recentBookings: recentBookingsResult,
        upcomingCheckIns: upcomingCheckInsResult,
        revenueByRoomType: revenueByRoomTypeResult.map((row) => ({
          roomType: row.roomType,
          revenue: Number(row.revenue || 0),
        })),
        bookingTrends: bookingTrendsResult.map((row) => ({
          date: row.date,
          count: row.count,
        })),
      },
    };
  } catch (error: any) {
    console.error("Error in getOwnerDashboardStats:", error);
    return {
      success: false,
      data: {} as OwnerDashboardStats,
      message: error.message,
    };
  }
};

// ====================== USER ANALYTICS ======================

interface UserDashboardStats {
  totalBookings: number;
  upcomingBookings: any[];
  pastBookings: any[];
  totalSpent: number;
  wishlistCount: number;
  favoriteHotel?: {
    hotelId: number;
    name: string;
    bookingCount: number;
  };
  bookingTrends: { date: string; count: number }[];
}

// ====================== ROLE-BASED ANALYTICS ENTRY POINT ======================
// ====================== ROLE-BASED ANALYTICS ENTRY POINT ======================
export const getUserDashboardStats = async (
  userId: number,
  dateRange?: DateRange
): Promise<AnalyticsResponse<UserDashboardStats>> => {
  try {
    // Default to last 12 months if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultEndDate.getMonth() - 12);

    const range = dateRange || {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    };

    validateDateRange(range);

    // Enhanced date handling utilities
    const safeFormatDate = (date: Date | string | null | undefined): string => {
      if (!date) return new Date().toISOString().split('T')[0];
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date encountered, using current date as fallback');
        return new Date().toISOString().split('T')[0];
      }
      return dateObj.toISOString().split('T')[0];
    };

    const ensureValidDate = (date: any): Date | null => {
      if (!date) return null;
      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return isNaN(dateObj.getTime()) ? null : dateObj;
      } catch (e) {
        console.warn('Date conversion error:', e);
        return null;
      }
    };

    // Get all stats in parallel
    const [
      totalBookingsResult,
      upcomingBookingsResult,
      pastBookingsResult,
      totalSpentResult,
      wishlistCountResult,
      favoriteHotelResult,
      bookingTrendsResult,
    ] = await Promise.all([
      // Total bookings count
      db
        .select({ count: count() })
        .from(bookings)
        .where(eq(bookings.userId, userId)),

      // Upcoming bookings (future check-ins)
      db.query.bookings.findMany({
        where: and(
          eq(bookings.userId, userId),
          gte(bookings.checkInDate, safeFormatDate(new Date())),
          ne(bookings.bookingStatus, "Cancelled"),
          isNotNull(bookings.checkInDate),
          isNotNull(bookings.checkOutDate)
        ),
        orderBy: asc(bookings.checkInDate),
        with: {
          room: {
            columns: {
              roomId: true,
              pricePerNight: true,
              thumbnail: true,
            },
            with: {
              hotel: {
                columns: {
                  name: true,
                  location: true,
                  thumbnail: true,
                },
              },
              roomType: {
                columns: {
                  name: true,
                },
              },
            },
          },
          payments: {
            where: eq(payments.paymentStatus, "Completed"),
            columns: {
              amount: true,
              paymentDate: true,
            },
          },
        },
      }),

      // Past bookings (completed stays)
      db
        .select({
          booking: bookings,
          room: {
            roomId: rooms.roomId,
            pricePerNight: rooms.pricePerNight,
            thumbnail: rooms.thumbnail,
          },
          hotel: {
            name: hotels.name,
            location: hotels.location,
          },
          roomType: {
            name: roomTypes.name,
          },
          payment: {
            amount: payments.amount,
          },
          review: {
            rating: reviews.rating,
            comment: reviews.comment,
          },
        })
        .from(bookings)
        .leftJoin(rooms, eq(bookings.roomId, rooms.roomId))
        .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
        .leftJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.roomTypeId))
        .leftJoin(
          payments,
          and(
            eq(payments.bookingId, bookings.bookingId),
            eq(payments.paymentStatus, "Completed")
          )
        )
        .leftJoin(reviews, eq(bookings.bookingId, reviews.bookingId))
        .where(
          and(
            eq(bookings.userId, userId),
            lte(bookings.checkOutDate, safeFormatDate(new Date())),
            ne(bookings.bookingStatus, "Cancelled"),
            isNotNull(bookings.checkInDate),
            isNotNull(bookings.checkOutDate)
          )
        )
        .orderBy(desc(bookings.checkOutDate))
        .limit(5),

      // Total amount spent (completed payments)
      db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
        .where(
          and(
            eq(bookings.userId, userId),
            eq(payments.paymentStatus, "Completed")
          )
        ),

      // Wishlist items count
      db
        .select({ count: count() })
        .from(wishlist)
        .where(eq(wishlist.userId, userId)),

      // Favorite hotel (most booked)
      db
        .select({
          hotelId: hotels.hotelId,
          name: hotels.name,
          bookingCount: sql<number>`COUNT(*)`,
        })
        .from(bookings)
        .innerJoin(rooms, eq(bookings.roomId, rooms.roomId))
        .innerJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
        .where(
          and(
            eq(bookings.userId, userId),
            ne(bookings.bookingStatus, "Cancelled")
          )
        )
        .groupBy(hotels.hotelId, hotels.name)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(1),

      // Booking trends (grouped by month)
      db
        .select({
          date: sql<string>`TO_CHAR(${bookings.createdAt}, 'YYYY-MM')`,
          count: count(),
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, userId),
            between(bookings.createdAt, range.startDate, range.endDate)
          )
        )
        .groupBy(sql`TO_CHAR(${bookings.createdAt}, 'YYYY-MM')`),
    ]);

    // Process bookings with additional date validation
    const processBookingDates = (booking: any) => {
      const checkInDate = ensureValidDate(booking.checkInDate);
      const checkOutDate = ensureValidDate(booking.checkOutDate);
      
      if (!checkInDate || !checkOutDate) {
        console.warn(`Invalid dates found for booking ${booking.bookingId}`);
        return null;
      }

      return {
        ...booking,
        checkInDate,
        checkOutDate,
      };
    };

    const processedUpcomingBookings = upcomingBookingsResult
      .map(processBookingDates)
      .filter(Boolean);

    const processedPastBookings = pastBookingsResult
      .map(row => ({
        ...processBookingDates(row.booking),
        room: {
          ...row.room,
          hotel: row.hotel,
          roomType: row.roomType,
        },
        payments: row.payment ? [row.payment] : [],
        review: row.review,
      }))
      .filter(Boolean);

    return {
      success: true,
      data: {
        totalBookings: totalBookingsResult[0]?.count || 0,
        upcomingBookings: processedUpcomingBookings,
        pastBookings: processedPastBookings,
        totalSpent: Number(totalSpentResult[0]?.total || 0),
        wishlistCount: wishlistCountResult[0]?.count || 0,
        favoriteHotel: favoriteHotelResult[0]
          ? {
              hotelId: favoriteHotelResult[0].hotelId,
              name: favoriteHotelResult[0].name,
              bookingCount: Number(favoriteHotelResult[0].bookingCount),
            }
          : undefined,
        bookingTrends: bookingTrendsResult.map((row) => ({
          date: row.date,
          count: row.count,
        })),
      },
    };
  } catch (error: any) {
    console.error("Error in getUserDashboardStats:", error);
    return {
      success: false,
      data: {} as UserDashboardStats,
      message: error.message || "Failed to fetch user dashboard stats",
    };
  }
};
// analytics.service.ts
export const getRoleBasedDashboardStats = async (
  userId: number,
  userRole: TRole,
  dateRange?: DateRange
) => {
  try {
    // Convert string dates to Date objects if needed
    const range = dateRange ? {
      startDate: typeof dateRange.startDate === 'string' 
        ? new Date(dateRange.startDate) 
        : dateRange.startDate,
      endDate: typeof dateRange.endDate === 'string'
        ? new Date(dateRange.endDate)
        : dateRange.endDate
    } : undefined;

    switch (userRole) {
      case "admin":
        return getAdminDashboardStats(range);
      case "owner":
        return getOwnerDashboardStats(userId, range);
      case "user":
        return getUserDashboardStats(userId, range);
      default:
        throw new Error("Invalid user role");
    }
  } catch (error: any) {
    console.error("Error in getRoleBasedDashboardStats:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
