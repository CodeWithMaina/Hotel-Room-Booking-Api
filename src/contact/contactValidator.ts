import { z } from 'zod';

// Type for the contact message input
export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

// Type for the successful response
export interface ContactSuccessResponse {
  success: true;
  message: string;
  data?: {
    id: number;
    name: string;
    email: string;
  };
}

// Type for the error response
export interface ContactErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Combined response type
export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

// Zod schema for input validation
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(100),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});