import db from "../drizzle/db";
import { contactMessages, TContactMessagesSelect } from "../drizzle/schema";

export const saveContactMessage = async (
  name: string,
  email: string,
  message: string
): Promise<TContactMessagesSelect | null> => {
  try {
    const result = await db.insert(contactMessages)
      .values({ name, email, message })
      .returning();
    
    return result[0] ?? null; 
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return null;
  }
};