import db from "../drizzle/db";
import { desc, eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { TUserInsert, TUserSelect } from "../drizzle/schema";
import { TUserReturn, TUserUpdateSchema } from "./userUpdateSchema";

interface TReturnUser {
  firstName: string;
  lastName: string;
  bio: string | null;
  email: string;
  profileImage: string | null;
  contactPhone: string | null;
  role: "user" | "admin" | "owner" | null;
}
export const getUsersService = async (): Promise<TUserSelect[]> => {
  return await db.query.users.findMany({
    orderBy: desc(users.userId),
  });
};

export const getUserByIdService = async (
  userId: number
): Promise<TReturnUser | null> => {
  const result = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: {
      firstName: true,
      lastName: true,
      bio: true,
      email: true,
      profileImage: true,
      contactPhone: true,
      role: true,
    },
  });
  return result || null;
};

export const createUserService = async (
  userData: TUserInsert
): Promise<TUserSelect> => {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
};

export const updateUserService = async (
  userId: number,
  userData: Partial<TUserUpdateSchema>
): Promise<TUserReturn | null> => {
  try {
    const result = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, userId))
      .returning({
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImage: users.profileImage,
        bio: users.bio,
        contactPhone: users.contactPhone,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return result[0] || null;
  } catch (error) {
    console.error("Database update error:", error);
    throw error;
  }
};

// export const updateUserService = async (
//   userId: number,
//   userData: Partial<TUserInsert>
// ): Promise<TUserSelect | null> => {
//   const result = await db
//     .update(users)
//     .set(userData)
//     .where(eq(users.userId, userId))
//     .returning();

//   return result[0] || null;
// };

export const deleteUserService = async (
  userId: number
): Promise<TUserSelect | null> => {
  const result = await db
    .delete(users)
    .where(eq(users.userId, userId))
    .returning();

  return result[0] || null;
};
