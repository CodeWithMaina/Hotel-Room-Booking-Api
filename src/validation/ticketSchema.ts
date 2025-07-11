import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  userId: z.number().nullable().optional(),
});

export const replyTicketSchema = z.object({
  reply: z.string().min(5, "Reply must be at least 5 characters"),
});

export type TCreateTicketSchema = z.infer<typeof createTicketSchema>;
export type TReplyTicketSchema = z.infer<typeof replyTicketSchema>;