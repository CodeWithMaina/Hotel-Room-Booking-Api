import db from "../drizzle/db";
import { and, eq, gte, inArray, lte, ne, or, desc } from "drizzle-orm";
import {
  amenities,
  bookings,
  entityAmenities,
  rooms,
  roomTypes,
  TRoomTypeInsert,
} from "../drizzle/schema";
import { TRoomInsert, TRoomSelect } from "../drizzle/schema";
import { TRoomAmenity, TRoomWithAmenities } from "../types/roomTypes";
import { getAmenitiesForOneEntity } from "../entityAmenities/enityAmenities.service";

type TEntityType = "room" | "hotel";

export const getRoomsService = async (): Promise<TRoomSelect[]> => {
  return await db.query.rooms.findMany({
    with: {
      roomType: true,
    },
    orderBy: desc(rooms.roomId),
  });
};

export const getRoomByIdService = async (
  roomId: number
): Promise<TRoomSelect | null> => {
  const result = await db.query.rooms.findFirst({
    where: eq(rooms.roomId, roomId),
    with: {
      roomType: true,
    },
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
  roomData: Partial<TRoomInsert> & { 
    amenities?: number[];
    roomType?: Partial<TRoomTypeInsert>;
  }
): Promise<TRoomSelect | null> => {
  try {
    // Prepare the update data
    const { amenities = [], roomType, ...roomUpdateData } = roomData;

    // Ensure createdAt is a proper Date object if it exists
    if (roomUpdateData.createdAt && !(roomUpdateData.createdAt instanceof Date)) {
      roomUpdateData.createdAt = new Date(roomUpdateData.createdAt);
    }

    // Update room type if provided
    if (roomType && roomUpdateData.roomTypeId) {
      const typeUpdateData = { ...roomType };
      // Ensure roomType createdAt is properly formatted
      if (typeUpdateData.createdAt && !(typeUpdateData.createdAt instanceof Date)) {
        typeUpdateData.createdAt = new Date(typeUpdateData.createdAt);
      }
      await db.update(roomTypes)
        .set(typeUpdateData)
        .where(eq(roomTypes.roomTypeId, roomUpdateData.roomTypeId));
    }

    // Update basic room info
    const [updatedRoom] = await db
      .update(rooms)
      .set(roomUpdateData)
      .where(eq(rooms.roomId, roomId))
      .returning();
    
    if (!updatedRoom) return null;
    
    // Handle amenities
    await db.delete(entityAmenities)
      .where(
        and(
          eq(entityAmenities.entityId, roomId),
          eq(entityAmenities.entityType, "room")
        )
      );
    
    if (amenities.length > 0) {
      await db.insert(entityAmenities).values(
        amenities.map(amenityId => ({
          amenityId,
          entityId: roomId,
          entityType: "room" as TEntityType,
          createdAt: new Date() // Ensure createdAt is a Date object
        }))
      );
    }
    
    return updatedRoom;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
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
    with: {
      roomType: true,
    },
    orderBy: desc(rooms.roomId),
  });
  return results;
};

export const getRoomWithAmenitiesService = async (
  roomId: number
): Promise<TRoomWithAmenities | null> => {
  const room = await getRoomByIdService(roomId);

  if (!room) return null;

  const roomEntityAmenities = await getAmenitiesForOneEntity(roomId, "room");

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
        createdAt: new Date(a.createdAt!), // ensure correct type
      }));
  }

  return {
    room,
    amenities: roomAmenities,
  };
};

export const getAvailableRoomsOnDatesService = async (
  checkInDate: string,
  checkOutDate: string
): Promise<TRoomSelect[]> => {
  const allRooms = await db.select().from(rooms);

  const bookedRoomIdsResult = await db
    .selectDistinct({ roomId: bookings.roomId })
    .from(bookings)
    .where(
      and(
        ne(bookings.bookingStatus, "Cancelled"),
        or(
          and(
            lte(bookings.checkInDate, checkOutDate),
            gte(bookings.checkOutDate, checkInDate)
          )
        )
      )
    );

  const bookedRoomIds = bookedRoomIdsResult.map((b) => b.roomId);

  const availableRooms = allRooms.filter(
    (room) => !bookedRoomIds.includes(room.roomId)
  );

  return availableRooms;
};

const toDateString = (date: Date) => date.toISOString().split("T")[0];

export const updateRoomAvailability = async (roomId: number) => {
  const today = new Date();

  const futureBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.roomId, roomId),
      ne(bookings.bookingStatus, "Cancelled"),
      gte(bookings.checkOutDate, toDateString(new Date()))
    ),
  });

  const isFullyBooked = futureBookings.length > 0;

  await db
    .update(rooms)
    .set({ isAvailable: !isFullyBooked })
    .where(eq(rooms.roomId, roomId));
};