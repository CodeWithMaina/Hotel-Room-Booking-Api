import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { TUserInsert, TUserSelect } from "../drizzle/schema";

interface TReturnUser {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  contactPhone: string | null;
  role: "user" | "admin" | "owner" | null;
}
export const getUsersService = async (): Promise<TUserSelect[]> => {
  return await db.query.users.findMany({});
};

export const getUserByIdService = async (
  userId: number
): Promise<TReturnUser | null> => {
  const result = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: {
      firstName: true,
      lastName: true,
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
  userData: Partial<TUserInsert>
): Promise<TUserSelect | null> => {
  const result = await db
    .update(users)
    .set(userData)
    .where(eq(users.userId, userId))
    .returning();

  return result[0] || null;
};

export const deleteUserService = async (
  userId: number
): Promise<TUserSelect | null> => {
  const result = await db
    .delete(users)
    .where(eq(users.userId, userId))
    .returning();

  return result[0] || null;
};
