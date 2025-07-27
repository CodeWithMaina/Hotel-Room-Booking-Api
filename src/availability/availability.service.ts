import db from "../drizzle/db";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { rooms, roomTypes, type TRoomSelect, type TRoomTypeSelect } from "../drizzle/schema";
import { format } from "date-fns";

interface AvailabilityParams {
  checkInDate: Date;
  checkOutDate: Date;
  capacity?: number;
}

type RoomWithRoomType = TRoomSelect & {
  roomType: TRoomTypeSelect | null;
};

export const checkRoomAvailabilityService = async ({
  checkInDate,
  checkOutDate,
  capacity,
}: AvailabilityParams): Promise<RoomWithRoomType[]> => {
  const formattedCheckIn = format(checkInDate, "yyyy-MM-dd");
  const formattedCheckOut = format(checkOutDate, "yyyy-MM-dd");

  try {
    const results = await db
      .select({
        roomId: rooms.roomId,
        hotelId: rooms.hotelId,
        roomTypeId: rooms.roomTypeId,
        pricePerNight: rooms.pricePerNight,
        capacity: rooms.capacity,
        thumbnail: rooms.thumbnail,
        description: rooms.description,
        gallery: rooms.gallery,
        isAvailable: rooms.isAvailable,
        createdAt: rooms.createdAt,
        roomType: {
          roomTypeId: roomTypes.roomTypeId,
          name: roomTypes.name,
          description: roomTypes.description,
          createdAt: roomTypes.createdAt,
        },
      })
      .from(rooms)
      .leftJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.roomTypeId))
      .where(
        and(
          sql`NOT EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings."roomId" = rooms."roomId"
            AND bookings."bookingStatus" != 'Cancelled'
            AND (
              bookings."checkInDate" <= ${formattedCheckOut}
              AND bookings."checkOutDate" >= ${formattedCheckIn}
            )
          )`,
          capacity ? gte(rooms.capacity, capacity) : sql`TRUE`
        )
      )
      .orderBy(desc(rooms.roomId));

    return results as RoomWithRoomType[];
  } catch (err: any) {
    console.error("❌ Error checking room availability:", err);
    throw new Error("Internal server error when querying room availability.");
  }
};
