import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { hotels, THotelInsert, THotelSelect } from "../drizzle/schema";

//Getting all hotels
export const getHotelsService = async ():Promise<THotelSelect[] | null> => {
    return await db.query.hotels.findMany({});
};
// Get hotel by ID
export const getHotelByIdService = async(hotelId: number):Promise<THotelSelect | null> => {
    const results = await db.query.hotels.findFirst({
        where: eq(hotels.hotelId, hotelId)
    });
    return results || null;
};

// Creating a hotel
export const createHotelService = async (hotelData:THotelInsert):Promise<THotelSelect> => {
    const results = await db.insert(hotels).values(hotelData).returning();
    return results[0];
};

// Update hotel service
export const updateHotelService = async (hotelId: number, hotelData: Partial<THotelInsert>):Promise<THotelSelect | null> => {
    const results = await db.update(hotels).set(hotelData).where(eq(hotels.hotelId, hotelId)).returning();
    return results[0] || null;
};

// Deleting a hotel
export const deleteHotelService = async (hotelId: number):Promise<THotelSelect | null> => {
    const results = await db.delete(hotels).where(eq(hotels.hotelId,hotelId)).returning();
    return results[0] || null;
};