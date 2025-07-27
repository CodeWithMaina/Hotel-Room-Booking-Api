// import { z } from "zod";

// export const reviewSchema = z.object({
//   userId: z.number(),
//   bookingId: z.number(),
//   rating: z.preprocess(
//     (val) => (typeof val === "string" ? parseFloat(val) : val),
//     z.number().min(0).max(5)
//   ),
//   hotelId: z.number().nullable().optional(),
//   roomId: z.number().nullable().optional(),
//   comment: z.string().optional(),
// });

// export type TReviewInput = z.infer<typeof reviewSchema>;

import { z } from "zod";

export const reviewSchema = z.object({
  userId: z.number(),
  bookingId: z.number(),
  rating: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(0).max(5)
  ),
  hotelId: z.number().nullable().optional(),
  roomId: z.number().nullable().optional(),
  comment: z.string().optional(),
});

export const reviewUpdateSchema = reviewSchema.partial();

export type TReviewInput = z.infer<typeof reviewSchema>;
export type TReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;