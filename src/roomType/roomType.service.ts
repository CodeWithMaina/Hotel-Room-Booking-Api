import { desc, eq } from "drizzle-orm";
import db from "../drizzle/db";
import { roomTypes } from "../drizzle/schema";

export const createRoomType = async (data: typeof roomTypes.$inferInsert) => {
  return db.insert(roomTypes).values(data).returning();
};

export const getRoomTypes = async () => {
  return db.query.roomTypes.findMany({
    orderBy: desc(roomTypes.roomTypeId),
  });
};

export const getRoomTypeById = async (id: number) => {
  return db.query.roomTypes.findFirst({
    where: eq(roomTypes.roomTypeId, id),
  });
};

export const updateRoomType = async (
  id: number,
  data: Partial<typeof roomTypes.$inferInsert>
) => {
  return db
    .update(roomTypes)
    .set(data)
    .where(eq(roomTypes.roomTypeId, id))
    .returning();
};

export const deleteRoomType = async (id: number) => {
  return db.delete(roomTypes).where(eq(roomTypes.roomTypeId, id)).returning();
};
