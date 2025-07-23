import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "../drizzle/schema";
import db from "../drizzle/db";

// Confirm if an email exists in the table
export const confirmEmailInSubscription = async (
  email: string
): Promise<(typeof newsletterSubscribers.$inferSelect) | null> => {
  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  return result[0] || null;
};

// Add a new subscriber
export const subscribeEmail = async (
  email: string
): Promise<"subscribed" | "already-subscribed" | "error"> => {
  try {
    const existing = await confirmEmailInSubscription(email);
    if (existing) return "already-subscribed";

    await db.insert(newsletterSubscribers).values({
      email,
    });

    return "subscribed";
  } catch (error) {
    console.error("Subscription error:", error);
    return "error";
  }
};

// Delete subscriber (if you want to support unsubscribe)
export const unsubscribeEmail = async (
  email: string
): Promise<boolean> => {
  try {
    const result = await db
      .delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));

    return (result?.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return false;
  }
};
