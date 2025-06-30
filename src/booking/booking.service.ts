import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { bookings } from "../drizzle/schema";
import { TBookingInsert, TBookingSelect } from "../drizzle/schema";

export const getBookingsService = async (): Promise<TBookingSelect[]> => {
    return await db.query.bookings.findMany();
};

export const getBookingByIdService = async (bookingId: number): Promise<TBookingSelect | null> => {
    const result = await db.query.bookings.findFirst({
        where: eq(bookings.bookingId, bookingId)
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