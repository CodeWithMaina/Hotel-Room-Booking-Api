import db from "../drizzle/db";
import { and, count, desc, eq, gte, inArray, lte, ne, or } from "drizzle-orm";
import {
  bookings,
  payments,
  rooms,
  TPaymentInsert,
  TPaymentSelect,
} from "../drizzle/schema";
import { TBookingInsert, TBookingSelect } from "../drizzle/schema";
import {
  TBookingFindParams,
  TBookingsResponse,
  TBookingStatus,
} from "../types/types";
import { TBookingInsertForm } from "../types/bookingTypes";
import { format } from "date-fns";
import {
  BookingStatusFilterParams,
  PaginatedResponse,
  PaginationParams,
} from "../types/paginationTypes";

const queryParams: TBookingFindParams = {
  columns: {
    bookingId: true,
    checkInDate: true,
    checkOutDate: true,
    createdAt: true,
    totalAmount: true,
    bookingStatus: true,
  },
  with: {
    user: {
      columns: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        contactPhone: true,
        address: true,
        role: true,
      },
    },
    room: {
      columns: {
        roomId: true,
        roomType: true,
        hotelId: true,
        pricePerNight: true,
        thumbnail: true,
        capacity: true,
        amenities: true,
        isAvailable: true,
      },
    },
  },
};

export const getBookingsService = async (
  params: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<TBookingsResponse>> => {
  const offset = (params.page - 1) * params.limit;

  // Get paginated results with latest first
  const results = await db.query.bookings.findMany({
    ...queryParams,
    limit: params.limit,
    offset: offset,
    orderBy: desc(bookings.createdAt),
  });

  // Get total count
  const totalResult = await db.select({ count: count() }).from(bookings);
  const total = totalResult[0].count;

  const data = results as unknown as TBookingsResponse;

  return {
    success: true,
    data,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
      hasNextPage: params.page * params.limit < total,
      hasPreviousPage: params.page > 1,
    },
  };
};

export const getBookingByIdService = async (
  bookingId: number
): Promise<TBookingSelect | null> => {
  const result = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId),
    with: {
      user: {
        columns: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true,
          role: true,
        },
      },
      room: {
        columns: {
          roomId: true,
          roomType: true,
          hotelId: true,
          thumbnail: true,
          pricePerNight: true,
          capacity: true,
          isAvailable: true,
        },
      },
    },
  });
  return result || null;
};

const toDateString = (date: Date) => date.toISOString().split("T")[0];

export const createBookingService = async (
  data: TBookingInsertForm
): Promise<TBookingSelect> => {
  // Validate input dates
  if (!data.checkInDate || !data.checkOutDate) {
    throw new Error("Missing check-in or check-out date");
  }

  // Convert and validate dates
  const checkInDate = new Date(data.checkInDate);
  const checkOutDate = new Date(data.checkOutDate);

  if (isNaN(checkInDate.getTime())) throw new Error("Invalid check-in date");
  if (isNaN(checkOutDate.getTime())) throw new Error("Invalid check-out date");
  if (checkInDate >= checkOutDate)
    throw new Error("Check-out must be after check-in");

  // Validate room exists and is available
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.roomId, data.roomId),
  });

  if (!room) throw new Error("Room not found");
  if (!room.isAvailable) throw new Error("Room is not available");

  // Check for booking conflicts with overlapping dates
  const conflicts = await db.query.bookings.findMany({
    where: and(
      eq(bookings.roomId, data.roomId),
      ne(bookings.bookingStatus, "Cancelled"),
      or(
        and(
          lte(bookings.checkInDate, format(checkOutDate, "yyyy-MM-dd")),
          gte(bookings.checkOutDate, format(checkInDate, "yyyy-MM-dd"))
        )
      )
    ),
  });

  if (conflicts.length > 0) {
    throw new Error("Room is already booked for the selected dates");
  }

  // Transaction for booking
  return await db.transaction(async (tx) => {
    const [booking] = await tx
      .insert(bookings)
      .values({
        ...data,
        checkInDate: format(checkInDate, "yyyy-MM-dd"),
        checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
        bookingStatus: "Pending",
      })
      .returning();

    return booking;
  });
};

export const updateBookingService = async (
  bookingId: number,
  bookingData: Partial<TBookingInsert>
): Promise<TBookingSelect | null> => {
  const result = await db
    .update(bookings)
    .set(bookingData)
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return result[0] || null;
};

export const deleteBookingService = async (
  bookingId: number
): Promise<TBookingSelect | null> => {
  const result = await db
    .delete(bookings)
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return result[0] || null;
};

export const getBookingsByUserIdService = async (
  userId: number,
  params: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<TBookingSelect[]>> => {
  const offset = (params.page - 1) * params.limit;

  const bookingsData = await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    with: {
      room: true,
    },
    limit: params.limit,
    offset: offset,
    orderBy: desc(bookings.createdAt),
  });

  const totalResult = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.userId, userId));
  const total = totalResult[0].count;

  return {
    success: true,
    data: bookingsData,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
      hasNextPage: params.page * params.limit < total,
      hasPreviousPage: params.page > 1,
    },
  };
};

export const checkRoomAvailabilityService = async (
  roomId: number,
  checkInDate: string,
  checkOutDate: string
) => {
  const conflicts = await db.query.bookings.findMany({
    where: and(
      eq(bookings.roomId, roomId),
      or(
        and(
          lte(bookings.checkInDate, checkOutDate),
          gte(bookings.checkOutDate, checkInDate)
        ),
        ne(bookings.bookingStatus, "Cancelled")
      )
    ),
  });

  return conflicts.length === 0;
};

export const getBookingsByStatusService = async (
  params: BookingStatusFilterParams = {
    page: 1,
    limit: 10,
    status: ["Pending", "Confirmed", "Cancelled"],
  }
): Promise<PaginatedResponse<TBookingsResponse>> => {
  const offset = (params.page - 1) * params.limit;

  // Validate status values
  const validStatuses: TBookingStatus[] = ["Pending", "Confirmed", "Cancelled"];
  const filteredStatus =
    params.status?.filter((s) => validStatuses.includes(s)) || validStatuses;

  // Get paginated results with status filter
  const results = await db.query.bookings.findMany({
    ...queryParams,
    where: inArray(bookings.bookingStatus, filteredStatus),
    limit: params.limit,
    offset: offset,
    orderBy: desc(bookings.createdAt),
  });

  // Get total count with the same filter
  const totalResult = await db
    .select({ count: count() })
    .from(bookings)
    .where(inArray(bookings.bookingStatus, filteredStatus));
  const total = totalResult[0].count;

  const data = results as unknown as TBookingsResponse;

  return {
    success: true,
    data,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
      hasNextPage: params.page * params.limit < total,
      hasPreviousPage: params.page > 1,
    },
  };
};

export const updateBookingStatusService = async (
  bookingId: number,
  status: TBookingStatus
): Promise<TBookingSelect | null> => {
  const result = await db
    .update(bookings)
    .set({
      bookingStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return result[0] || null;
};

export const confirmBookingService = async (
  bookingId: number
): Promise<TBookingSelect | null> => {
  return await db.transaction(async (tx) => {
    const result = await tx
      .update(bookings)
      .set({
        bookingStatus: "Confirmed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.bookingId, bookingId))
      .returning();

    return result[0] || null;
  });
};
