import { and, desc, eq, inArray } from "drizzle-orm";
import db from "../drizzle/db";
import {
  addresses,
  amenities,
  entityAmenities,
  hotels,
  TAddressSelect,
  TAmenitySelect,
  TEntityAmenitySelect,
  THotelInsert,
  THotelSelect,
} from "../drizzle/schema";

type Hotel = {
  hotelId: number;
  name: string;
  ownerId: number | null;
  location: string | null;
  thumbnail: string | null;
  description: string | null;
  contactPhone: string | null;
  category: string | null;
  rating: string | null;
  owner: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
    contactPhone: string | null;
  } | null;
};

//Getting all hotels
export const getHotelsService = async (): Promise<Hotel[] | null> => {
  return await db.query.hotels.findMany({
    columns: {
      hotelId: true,
      ownerId: true,
      name: true,
      location: true,
      description: true,
      thumbnail: true,
      contactPhone: true,
      category: true,
      rating: true,
    },
    with: {
      owner: {
        columns: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          contactPhone: true,
        },
      },
    },
    orderBy: desc(hotels.hotelId),

  });
};
// Get hotel by ID
export const getHotelByIdService = async (
  hotelId: number
): Promise<THotelSelect | null> => {
  const results = await db.query.hotels.findFirst({
    where: eq(hotels.hotelId, hotelId),
    with: {
      owner: {
        columns: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          contactPhone: true,
        },
      },
    },
  });
  return results || null;
};

// Creating a hotel
export const createHotelService = async (
  hotelData: THotelInsert
): Promise<THotelSelect> => {
  // Ensure gallery is properly formatted
  const formattedData = {
    ...hotelData,
    gallery: Array.isArray(hotelData.gallery) ? hotelData.gallery : [],
    thumbnail: hotelData.thumbnail || null,
  };

  const results = await db.insert(hotels).values(formattedData).returning();
  return results[0];
};

// Update hotel service
export const updateHotelService = async (
  hotelId: number,
  hotelData: Partial<THotelInsert>
): Promise<THotelSelect | null> => {
  const results = await db
    .update(hotels)
    .set(hotelData)
    .where(eq(hotels.hotelId, hotelId))
    .returning();
  return results[0] || null;
};

// Deleting a hotel
export const deleteHotelService = async (
  hotelId: number
): Promise<THotelSelect | null> => {
  const results = await db
    .delete(hotels)
    .where(eq(hotels.hotelId, hotelId))
    .returning();
  return results[0] || null;
};

export const getHotelAddressService = async (
  hotelId: number
): Promise<TAddressSelect | null> => {
  const result = await db.query.addresses.findFirst({
    where: and(
      eq(addresses.entityId, hotelId),
      eq(addresses.entityType, "hotel")
    ),
  });
  return result || null;
};

export const getHotelEntityAmenitiesService = async (
  hotelId: number
): Promise<TEntityAmenitySelect[]> => {
  return await db.query.entityAmenities.findMany({
    where: and(
      eq(entityAmenities.entityId, hotelId),
      eq(entityAmenities.entityType, "hotel")
    ),
    with: {
      amenity: true,
    },
  });
};

export const getHotelAmenitiesDetailsService = async (
  hotelId: number
): Promise<TAmenitySelect[]> => {
  const entityAmenities = await getHotelEntityAmenitiesService(hotelId);
  const amenityIds = entityAmenities
    .map((ea) => ea.amenityId)
    .filter((id): id is number => id !== null && id !== undefined);

  if (amenityIds.length === 0) return [];

  return await db.query.amenities.findMany({
    where: inArray(amenities.amenityId, amenityIds),
  });
};

export const getHotelFullDetailsService = async (hotelId: number) => {
  try {
    const [address, entityAmenities, hotel] = await Promise.all([
      getHotelAddressService(hotelId),
      getHotelEntityAmenitiesService(hotelId),
      getHotelByIdService(hotelId),
    ]);

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Safely get amenity details
    const amenityDetails = await (async () => {
      if (!entityAmenities || entityAmenities.length === 0) {
        return [];
      }

      const amenityIds = entityAmenities
        .map((ea) => ea.amenityId)
        .filter((id): id is number => id !== null && id !== undefined);

      if (amenityIds.length === 0) {
        return [];
      }

      try {
        return await db.query.amenities.findMany({
          where: inArray(amenities.amenityId, amenityIds),
        });
      } catch (error) {
        console.error('Error fetching amenities:', error);
        return [];
      }
    })();

    return {
      success: true,
      data: {
        hotel,
        address: address || null,
        amenities: amenityDetails || [],
      }
    };
  } catch (error) {
    console.error('Error in getHotelFullDetailsService:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch hotel details',
      data: null
    };
  }
};
