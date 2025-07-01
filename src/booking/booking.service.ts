import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { bookings } from "../drizzle/schema";
import { TBookingInsert, TBookingSelect } from "../drizzle/schema";
import { TBookingFindParams, TBookingsResponse } from "../types/types";

export const getBookingsService = async (): Promise<TBookingsResponse> => {
    // You can replace 'any[]' with a more specific type if you define one that matches the shape returned by findMany
    const queryParams:TBookingFindParams  = {
        columns: {
            bookingId: true,
            checkInDate: true,
            checkOutDate: true,
            createdAt: true,
            totalAmount: true,
            bookingStatus: true
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
                }
            },
            room: {
                columns: {
                    roomId: true,
                    roomType: true,
                    hotelId: true,
                    pricePerNight: true,
                    capacity: true,
                    amenities: true,
                    isAvailable: true,
                }
            }
        }
    }
    const results = await db.query.bookings.findMany(queryParams);
    return results as unknown as TBookingsResponse;
};

export const getBookingByIdService = async (bookingId: number): Promise<TBookingSelect | null> => {
    const result = await db.query.bookings.findFirst({
        where: eq(bookings.bookingId, bookingId),
    });
    return result || null;
};

export const createBookingService = async (bookingData: TBookingInsert): Promise<TBookingSelect> => {
    const result = await db.insert(bookings).values(bookingData).returning();
    return result[0];
};

export const updateBookingService = async (
    bookingId: number, 
    bookingData: Partial<TBookingInsert>
): Promise<TBookingSelect | null> => {
    const result = await db.update(bookings)
        .set(bookingData)
        .where(eq(bookings.bookingId, bookingId))
        .returning();
    
    return result[0] || null;
};

export const deleteBookingService = async (bookingId: number): Promise<TBookingSelect | null> => {
    const result = await db.delete(bookings)
        .where(eq(bookings.bookingId, bookingId))
        .returning();
    
    return result[0] || null;
};