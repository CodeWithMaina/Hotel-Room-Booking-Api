import { desc, eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import {
  bookings,
  payments,
  TPaymentInsert,
  TPaymentSelect,
} from "../drizzle/schema";

// Get all payments
export const getPaymentsService = async (): Promise<
  TPaymentSelect[] | null
> => {
  const results = await db.query.payments.findMany({
    with: {
      booking: true,
    },
    orderBy: desc(payments.paymentDate),
  });
  return results || null;
};

// Get payment by ID
export const getPaymentByIdService = async (
  paymentId: number
): Promise<TPaymentSelect | null> => {
  const results = await db.query.payments.findFirst({
    where: eq(payments.paymentId, paymentId),
  });
  return results || null;
};

// Get booking by ID
export const getPaymentByBookingIdService = async (
  bookingId: number
): Promise<TPaymentSelect | null> => {
  const results = await db.query.payments.findFirst({
    where: eq(payments.bookingId, bookingId),
  });
  return results || null;
};

// Create payment
export const createPaymentService = async (
  paymentData: TPaymentInsert
): Promise<TPaymentSelect | null> => {
  // Verify the booking exists
  if (typeof paymentData.bookingId !== "number") {
    throw new Error("Invalid or missing bookingId in payment data");
  }
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, paymentData.bookingId),
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Validate amount against booking total if payment is being completed
  if (
    paymentData.paymentStatus === "Completed" &&
    paymentData.amount !== booking.totalAmount
  ) {
    throw new Error(
      "Payment amount must match booking total for completed payments"
    );
  }

  // Validate payment status
  if (!["Pending", "Completed", "Failed"].includes(paymentData.paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  // Set payment date if status is Completed
  if (paymentData.paymentStatus === "Completed" && !paymentData.paymentDate) {
    paymentData.paymentDate = new Date();
  }
  const results = await db.insert(payments).values(paymentData).returning();
  return results[0] || null;
};

// Update payment
export const updatePaymentService = async (
  paymentId: number,
  paymentData: Partial<TPaymentInsert>
): Promise<TPaymentSelect | null> => {
  // Validate payment status if being updated
  if (
    paymentData.paymentStatus &&
    !["Pending", "Completed", "Failed"].includes(paymentData.paymentStatus)
  ) {
    throw new Error("Invalid payment status");
  }

  // If updating to Completed, set payment date if not provided
  if (paymentData.paymentStatus === "Completed" && !paymentData.paymentDate) {
    paymentData.paymentDate = new Date();
  }
  const results = await db
    .update(payments)
    .set(paymentData)
    .where(eq(payments.paymentId, paymentId))
    .returning();
  return results[0] || null;
};

// Delete payments
export const deletePaymentService = async (
  paymentId: number
): Promise<TPaymentSelect | null> => {
  const results = await db
    .delete(payments)
    .where(eq(payments.paymentId, paymentId))
    .returning();
  return results[0] || null;
};

export const updatePaymentByTransactionIdService = async (
  transactionId: string,
  paymentData: Partial<TPaymentInsert>
): Promise<TPaymentSelect | null> => {
  const results = await db
    .update(payments)
    .set(paymentData)
    .where(eq(payments.transactionId, transactionId))
    .returning();
  return results[0] || null;
};

export const getPaymentsByUserIdService = async (
  userId: number
): Promise<TPaymentSelect[]> => {
  const results = await db.query.payments.findMany({
    where: (payments, { exists }) => exists(
      db.select()
        .from(bookings)
        .where(
          and(
            eq(bookings.bookingId, payments.bookingId),
            eq(bookings.userId, userId)
          )
        )
    ),
    with: {
      booking: true
    }
  });

  return results;
};
