import { and, eq, inArray } from "drizzle-orm";
import db from "../drizzle/db";
import { addresses, amenities, entityAmenities, hotels, TAddressSelect, TAmenitySelect, TEntityAmenitySelect, THotelInsert, THotelSelect } from "../drizzle/schema";

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


export const getHotelAddressService = async (hotelId: number): Promise<TAddressSelect | null> => {
  const result = await db.query.addresses.findFirst({
    where: and(
      eq(addresses.entityId, hotelId),
      eq(addresses.entityType, 'hotel')
    )
  });
  return result || null;
};

export const getHotelEntityAmenitiesService = async (hotelId: number): Promise<TEntityAmenitySelect[]> => {
  return await db.query.entityAmenities.findMany({
    where: and(
      eq(entityAmenities.entityId, hotelId),
      eq(entityAmenities.entityType, 'hotel')
    ),
    with: {
      amenity: true
    }
  });
};

export const getHotelAmenitiesDetailsService = async (hotelId: number): Promise<TAmenitySelect[]> => {
  const entityAmenities = await getHotelEntityAmenitiesService(hotelId);
  const amenityIds = entityAmenities.map(ea => ea.amenityId).filter((id): id is number => id !== null && id !== undefined);
  
  if (amenityIds.length === 0) return [];
  
  return await db.query.amenities.findMany({
    where: inArray(amenities.amenityId, amenityIds)
  });
};


export const getHotelFullDetailsService = async (hotelId: number) => {
  const [address, entityAmenities, hotel] = await Promise.all([
    getHotelAddressService(hotelId),
    getHotelEntityAmenitiesService(hotelId),
    getHotelByIdService(hotelId)
  ]);
  
  const amenityIds = entityAmenities.map(ea => ea.amenityId).filter((id): id is number => id !== null && id !== undefined);
  const amenityDetails: TAmenitySelect[] = amenityIds.length > 0 
    ? await db.query.amenities.findMany({
        where: inArray(amenities.amenityId, amenityIds)
      })
    : [];
  
  return {
    address,
    amenities: amenityDetails,
    hotel
    // entityAmenities
  };
};