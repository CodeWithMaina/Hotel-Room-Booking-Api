import db from "../drizzle/db";
import { and, eq, sql } from "drizzle-orm";
import { rooms, TRoomSelect } from "../drizzle/schema";
import { format } from "date-fns";

interface AvailabilityParams {
  checkInDate: Date;
  checkOutDate: Date;
  capacity?: number;
}

export const checkRoomAvailabilityService = async ({
  checkInDate,
  checkOutDate,
  capacity,
}: AvailabilityParams): Promise<TRoomSelect[]> => {
  const formattedCheckIn = format(checkInDate, "yyyy-MM-dd");
  const formattedCheckOut = format(checkOutDate, "yyyy-MM-dd");

  console.log("🔍 Checking room availability with:", {
    checkInDate: formattedCheckIn,
    checkOutDate: formattedCheckOut,
    capacity,
  });

  try {
    const query = db
      .select()
      .from(rooms)
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
          capacity ? eq(rooms.capacity, capacity) : sql`TRUE`
        )
      )
      .orderBy(rooms.roomId);

    const availableRooms = await query;

    console.log(`✅ Found ${availableRooms.length} available room(s)`);

    return availableRooms;
  } catch (err: any) {
    console.error("❌ Error checking room availability:", err);
    throw new Error("Internal server error when querying room availability.");
  }
};
