import z from "zod";

export const roomTypeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const updateRoomTypeSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});