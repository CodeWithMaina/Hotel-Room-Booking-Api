import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { rooms } from "../drizzle/schema";
import { TRoomInsert, TRoomSelect } from "../drizzle/schema";

export const getRoomsService = async (): Promise<TRoomSelect[]> => {
    return await db.query.rooms.findMany();
};

export const getRoomByIdService = async (roomId: number): Promise<TRoomSelect | null> => {
    const result = await db.query.rooms.findFirst({
        where: eq(rooms.roomId, roomId)
    });
    return result || null;
};

export const createRoomService = async (roomData: TRoomInsert): Promise<TRoomSelect> => {
    const result = await db.insert(rooms).values(roomData).returning();
    return result[0];
};

export const updateRoomService = async (
    roomId: number, 
    roomData: Partial<TRoomInsert>
): Promise<TRoomSelect | null> => {
    const result = await db.update(rooms)
        .set(roomData)
        .where(eq(rooms.roomId, roomId))
        .returning();
    
    return result[0] || null;
};

export const deleteRoomService = async (roomId: number): Promise<TRoomSelect | null> => {
    const result = await db.delete(rooms)
        .where(eq(rooms.roomId, roomId))
        .returning();
    
    return result[0] || null;
};