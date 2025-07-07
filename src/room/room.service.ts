import db from "../drizzle/db";
import { and, eq, inArray } from "drizzle-orm";
import {
  amenities,
  entityAmenities,
  rooms,
  THotelSelect,
} from "../drizzle/schema";
import { TRoomInsert, TRoomSelect } from "../drizzle/schema";
import { TRoomAmenity, TRoomWithAmenities } from "../types/roomTypes";
import { getAmenitiesForOneEntity } from "../entityAmenities/enityAmenities.service";

export const getRoomsService = async (): Promise<TRoomSelect[]> => {
  return await db.query.rooms.findMany();
};

export const getRoomByIdService = async (
  roomId: number
): Promise<TRoomSelect | null> => {
  const result = await db.query.rooms.findFirst({
    where: eq(rooms.roomId, roomId),
  });
  return result || null;
};

export const createRoomService = async (
  roomData: TRoomInsert
): Promise<TRoomSelect> => {
  const result = await db.insert(rooms).values(roomData).returning();
  return result[0];
};

export const updateRoomService = async (
  roomId: number,
  roomData: Partial<TRoomInsert>
): Promise<TRoomSelect | null> => {
  const result = await db
    .update(rooms)
    .set(roomData)
    .where(eq(rooms.roomId, roomId))
    .returning();

  return result[0] || null;
};

export const deleteRoomService = async (
  roomId: number
): Promise<TRoomSelect | null> => {
  const result = await db
    .delete(rooms)
    .where(eq(rooms.roomId, roomId))
    .returning();

  return result[0] || null;
};

export const getRoomByHotelIdService = async (
  hotelId: number
): Promise<TRoomSelect[]> => {
  const results = await db.query.rooms.findMany({
    where: eq(rooms.hotelId, hotelId),
  });
  return results;
};

export const getRoomWithAmenitiesService = async (
  roomId: number
): Promise<TRoomWithAmenities | null> => {
  const room = await getRoomByIdService(roomId);

  if (!room) return null;

  const roomEntityAmenities = await getAmenitiesForOneEntity(roomId, "room");

  // Get all amenity details
  const amenityIds = roomEntityAmenities
    .map((ea) => ea.amenityId)
    .filter((id): id is number => id !== null);
  let roomAmenities: TRoomAmenity[] = [];

  if (amenityIds.length > 0) {
    const amenitiesResult = await db.query.amenities.findMany({
      where: inArray(amenities.amenityId, amenityIds),
    });
    roomAmenities = amenitiesResult
      .filter((a) => a.createdAt !== null)
      .map((a) => ({
        ...a,
        createdAt: a.createdAt as Date,
      }));
  }

  return {
    room,
    amenities: roomAmenities,
  };
};
