// src/services/userAnalytics.service.ts
import db from "../drizzle/db";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
  bookings,
  customerSupportTickets,
  payments,
  rooms,
  users,
  TBookingSelect,
  TCustomerSupportTicketSelect,
  TPaymentSelect,
  TRoomSelect,
  reviews,
  addresses,
} from "../drizzle/schema";
import { format, subMonths } from "date-fns";

export interface UserAnalytics {
  userId: number;
  openTicketsCount: number;
  totalAmountPaid: number;
  pendingAmount: number;
  recentBookings: TBookingSelect[];
  paymentsByMonth: { month: string; amount: number }[];
  suggestedRoom: TRoomSelect | null;
}

export const getUserAnalyticsService = async (
  userId: number
): Promise<UserAnalytics> => {
  // Verify user exists
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
  if (!user) throw new Error("User not found");

  // Get open tickets count
  const openTickets = await db
    .select({ count: count() })
    .from(customerSupportTickets)
    .where(
      and(
        eq(customerSupportTickets.userId, userId),
        eq(customerSupportTickets.status, "Open")
      )
    );
  const openTicketsCount = openTickets[0].count;

  // Get payment totals
  const paymentTotals = await db
    .select({
      totalPaid: sql<number>`sum(case when ${payments.paymentStatus} = 'Completed' then ${payments.amount} else 0 end)`,
      pending: sql<number>`sum(case when ${payments.paymentStatus} = 'Pending' then ${payments.amount} else 0 end)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
    .where(eq(bookings.userId, userId));

  const totalAmountPaid = Number(paymentTotals[0].totalPaid) || 0;
  const pendingAmount = Number(paymentTotals[0].pending) || 0;

  // Get recent 5 bookings
  const recentBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    orderBy: desc(bookings.createdAt),
    limit: 5,
    with: {
      room: {
        columns: {
          roomId: true,
          hotelId: true,
          pricePerNight: true,
          thumbnail: true,
        },
        with: {
          hotel: {
            columns: {
              name: true,
              thumbnail: true,
            },
          },
        },
      },
      payments: {
        columns: {
          amount: true,
          paymentStatus: true,
        },
      },
    },
  });

  // Get payments by month for last 6 months
  const sixMonthsAgo = subMonths(new Date(), 6);
  const paymentsByMonth = await db
    .select({
      month: sql<string>`to_char(${payments.paymentDate}, 'YYYY-MM')`,
      amount: sql<number>`sum(${payments.amount})`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
    .where(
      and(
        eq(bookings.userId, userId),
        gte(payments.paymentDate, sixMonthsAgo),
        eq(payments.paymentStatus, "Completed")
      )
    )
    .groupBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${payments.paymentDate}, 'YYYY-MM')`);

  // Get suggested room (simplified version - just get highest rated available room)
  const suggestedRoom = await db.query.rooms.findFirst({
    where: eq(rooms.isAvailable, true),
    with: {
      hotel: {
        columns: {
          name: true,
          thumbnail: true,
        },
      },
      reviews: {
        columns: {
          rating: true,
        },
      },
    },
    orderBy: (rooms, { desc }) => [
      desc(sql`(SELECT AVG(rating) FROM ${reviews} WHERE ${reviews.roomId} = ${rooms.roomId})`),
    ],
  });

  return {
    userId,
    openTicketsCount,
    totalAmountPaid,
    pendingAmount,
    recentBookings,
    paymentsByMonth: paymentsByMonth.map((row) => ({
      month: row.month,
      amount: Number(row.amount) || 0,
    })),
    suggestedRoom: suggestedRoom || null,
  };
};