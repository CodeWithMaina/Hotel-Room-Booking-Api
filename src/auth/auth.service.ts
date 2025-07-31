// auth.service.ts
import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TUserInsert, users } from "../drizzle/schema";

// Create a new user
export const createUserServices = async (user: TUserInsert): Promise<string> => {
  try {
    // Validate that password exists
    if (!user.password) {
      throw new Error("Password is required");
    }
    
    const result = await db.insert(users).values(user).returning();

    if (!result || result.length === 0) {
      throw new Error("Failed to create user");
    }

    return "User Created Successfully 😎";
  } catch (error: any) {
    console.error("Error in createUserServices:", error);
    throw error; // Re-throw the error to be handled by the controller
  }
};

// Get user by email
export const getUserByEmailService = async (email: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  return result;
};

// Update user password
export const updateUserPasswordService = async (
  email: string,
  newPassword: string
): Promise<string> => {
  try {
    // Validate that newPassword exists
    if (!newPassword) {
      throw new Error("New password is required");
    }

    const result = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      throw new Error("User not found or password update failed");
    }

    return "Password updated successfully";
  } catch (error: any) {
    console.error("Error in updateUserPasswordService:", error);
    throw error; // Re-throw the error to be handled by the controller
  }
};