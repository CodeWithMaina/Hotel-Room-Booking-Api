import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { entityAmenities } from "../drizzle/schema";
import { TEntityAmenityInsert, TEntityAmenitySelect } from "../drizzle/schema";

export const getEntityAmenitiesService = async (): Promise<TEntityAmenitySelect[]> => {
    return await db.query.entityAmenities.findMany({
         with: {
            amenity: true,
            room: true,
            hotel: true
        }
    });
};

export const getEntityAmenityByIdService = async (entityAmenityId: number): Promise<TEntityAmenitySelect | null> => {
    const result = await db.query.entityAmenities.findFirst({
        where: eq(entityAmenities.id, entityAmenityId),
         with: {
            amenity: true,
            room: true,
            hotel: true
        }
    });
    return result || null;
};

export const createEntityAmenityService = async (entityAmenityData: TEntityAmenityInsert): Promise<TEntityAmenitySelect> => {
    const result = await db.insert(entityAmenities).values(entityAmenityData).returning();
    return result[0];
};

export const updateEntityAmenityService = async (
    entityAmenityId: number, 
    entityAmenityData: Partial<TEntityAmenityInsert>
): Promise<TEntityAmenitySelect | null> => {
    const result = await db.update(entityAmenities)
        .set(entityAmenityData)
        .where(eq(entityAmenities.id, entityAmenityId))
        .returning();
    
    return result[0] || null;
};

export const deleteEntityAmenityService = async (entityAmenityId: number): Promise<TEntityAmenitySelect | null> => {
    const result = await db.delete(entityAmenities)
        .where(eq(entityAmenities.id, entityAmenityId))
        .returning();
    
    return result[0] || null;
};