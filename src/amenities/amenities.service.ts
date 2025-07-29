import db from "../drizzle/db";
import { desc, eq } from "drizzle-orm";
import { amenities } from "../drizzle/schema";
import { TAmenityInsert, TAmenitySelect } from "../drizzle/schema";

export const getAmenitiesService = async (): Promise<TAmenitySelect[]> => {
  return await db.query.amenities.findMany({
    orderBy: desc(amenities.amenityId),
  });
};

export const getAmenityByIdService = async (
  amenityId: number
): Promise<TAmenitySelect | null> => {
  const result = await db.query.amenities.findFirst({
    where: eq(amenities.amenityId, amenityId),
  });
  return result || null;
};

export const createAmenityService = async (
  amenityData: TAmenityInsert
): Promise<TAmenitySelect> => {
  const result = await db.insert(amenities).values(amenityData).returning();
  return result[0];
};

export const updateAmenityService = async (
  amenityId: number,
  amenityData: Partial<TAmenityInsert>
): Promise<TAmenitySelect | null> => {
  const result = await db
    .update(amenities)
    .set(amenityData)
    .where(eq(amenities.amenityId, amenityId))
    .returning();

  return result[0] || null;
};

export const deleteAmenityService = async (
  amenityId: number
): Promise<TAmenitySelect | null> => {
  const result = await db
    .delete(amenities)
    .where(eq(amenities.amenityId, amenityId))
    .returning();

  return result[0] || null;
};
