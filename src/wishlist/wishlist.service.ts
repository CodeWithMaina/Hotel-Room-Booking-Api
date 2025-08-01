import db from "../drizzle/db";
import { and, eq } from "drizzle-orm";
import { wishlist, rooms, hotels } from "../drizzle/schema";
import { TWishlistInsert, TWishlistSelect } from "../drizzle/schema";

export const getWishlistItemsByUserIdService = async (
  userId: number
): Promise<TWishlistSelect[]> => {
  const result = await db.query.wishlist.findMany({
    where: eq(wishlist.userId, userId),
    with: {
      room: {
        with: {
          hotel: true,
          roomType: true
        }
      }
    }
  });
  return result;
};

export const getWishlistItemByIdService = async (
  wishlistId: number
): Promise<TWishlistSelect | null> => {
  const result = await db.query.wishlist.findFirst({
    where: eq(wishlist.wishlistId, wishlistId),
    with: {
      room: {
        with: {
          hotel: true
        }
      }
    }
  });
  return result || null;
};

export const createWishlistItemService = async (
  wishlistData: TWishlistInsert
): Promise<TWishlistSelect> => {
  if (typeof wishlistData.userId !== 'number' || typeof wishlistData.roomId !== 'number') {
    throw new Error("Invalid userId or roomId");
  }

  const existingItem = await db.query.wishlist.findFirst({
    where: and(
      eq(wishlist.userId, wishlistData.userId),
      eq(wishlist.roomId, wishlistData.roomId)
    ),
  });

  if (existingItem) {
    throw new Error("Room already exists in wishlist");
  }

  const result = await db.insert(wishlist).values(wishlistData).returning();
  return result[0];
};

export const updateWishlistItemService = async (
  wishlistId: number,
  updateData: Partial<TWishlistInsert>
): Promise<TWishlistSelect> => {
  if (typeof wishlistId !== 'number') {
    throw new Error("Invalid wishlistId");
  }

  const result = await db
    .update(wishlist)
    .set(updateData)
    .where(eq(wishlist.wishlistId, wishlistId))
    .returning();

  if (!result[0]) {
    throw new Error("Wishlist item not found");
  }

  return result[0];
};

export const deleteWishlistItemService = async (
  wishlistId: number
): Promise<TWishlistSelect> => {
  if (typeof wishlistId !== 'number') {
    throw new Error("Invalid wishlistId");
  }

  const result = await db
    .delete(wishlist)
    .where(eq(wishlist.wishlistId, wishlistId))
    .returning();

  if (!result[0]) {
    throw new Error("Wishlist item not found");
  }

  return result[0];
};

export const checkInWishlistService = async (
  userId: number,
  roomId: number
): Promise<boolean> => {
  if (typeof userId !== 'number' || typeof roomId !== 'number') {
    throw new Error("Invalid userId or roomId");
  }

  const result = await db.query.wishlist.findFirst({
    where: and(
      eq(wishlist.userId, userId),
      eq(wishlist.roomId, roomId)
    ),
  });

  return !!result;
};