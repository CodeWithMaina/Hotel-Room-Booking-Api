import { z } from "zod";

export const userUpdateSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be at most 20 digits")
    .optional(),
  bio: z.string().max(1000, "Bio must be under 1000 characters").optional(),
  profileImage: z.string().url("Profile image must be a valid URL").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(), // Added password
});

export type TUserUpdateSchema = z.infer<typeof userUpdateSchema>;


export type TUserReturn = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
  contactPhone?: string | null;
  role: "admin" | "user" | "owner" | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

export type TUserType = "admin" | "user" | "owner" | null;
