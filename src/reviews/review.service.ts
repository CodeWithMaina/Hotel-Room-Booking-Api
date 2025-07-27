import { and, eq } from "drizzle-orm";
import { reviews, rooms, TReviewInsert } from "../drizzle/schema";
import db from "../drizzle/db";
import { TReviewInput, TReviewUpdateInput } from "./review.schema";

export const createReview = async (data: TReviewInput) => {
  return db
    .insert(reviews)
    .values({ ...data, rating: data.rating.toString() })
    .returning();
};

export const getAllReviews = async () => {
  return db.query.reviews.findMany({
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          contactPhone: true,
        }
      },
      // booking: {
      //   columns: {
      //     checkInDate: true,
      //     checkOutDate: true,
      //   }
      // },
      // room: {
      //   columns: {
      //     roomId: true,
      //     roomTypeId: true,
      //     pricePerNight: true,
      //     capacity: true,
      //   }
      // },
      // room: true,
      hotel: true,
    },
  });
};

export const getReviewById = async (id: number) => {
  return db.query.reviews.findFirst({
    where: eq(reviews.reviewId, id),
    with: {
      user: true,
      booking: true,
      room: true,
      hotel: true,
    },
  });
};

export const updateReview = async (id: number, data: TReviewUpdateInput) => {
  return db
    .update(reviews)
    .set({ ...data, rating: data.rating?.toString() })
    .where(eq(reviews.reviewId, id))
    .returning();
};

export const deleteReview = async (id: number) => {
  return db
    .delete(reviews)
    .where(eq(reviews.reviewId, id))
    .returning();
};

export const getReviewsByRoomType = async (roomTypeId: number) => {
  return db.query.reviews.findMany({
    where: and(
      eq(rooms.roomTypeId, roomTypeId),
      eq(reviews.roomId, rooms.roomId)
    ),
    with: {
      user: true,
      booking: true,
      room: true,
      hotel: true,
    },
  });
};