import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { bookings } from "../drizzle/schema";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Hotel Booking" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email send failed:", error);
  }
};

type BookingEmailType = "success" | "confirmation" | "failure";

interface BookingData {
  bookingId: number;
  amount?: number;
  transactionId?: string;
}

export const sendBookingEmail = async (
  templateCode: string,
  type: BookingEmailType,
  data: BookingData
) => {
  const { bookingId, amount, transactionId } = data;

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId),
    with: {
      user: true,
    },
  });

  if (!booking?.user) {
    console.error("❌ Booking or user not found");
    return;
  }

  const { email, firstName } = booking.user;

  const formatAmount = (amt?: number) =>
    amt ? `KES ${amt.toLocaleString()}` : "";

  let subject = "";
  let html = "";

  switch (type) {
    case "success":
      subject = "✅ Payment Successful";
      html = `
        <h2>Payment Received</h2>
        <p>Hi ${firstName},</p>
        <p>Your payment for Booking #${bookingId} was successful.</p>
        <p><strong>Amount Paid:</strong> ${formatAmount(amount)}</p>
        <p>We'll confirm your booking shortly.</p>
      `;
      break;
    case "confirmation":
      subject = "🏨 Booking Confirmed";
      html = `
        <h2>Your Booking is Confirmed</h2>
        <p>Hi ${firstName},</p>
        <p>Booking #${bookingId} has been confirmed.</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
      `;
      break;
    case "failure":
      subject = "❌ Payment Failed";
      html = `
        <h2>Payment Failed</h2>
        <p>Hi ${firstName},</p>
        <p>Your payment for Booking #${bookingId} failed.</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>Please try again or contact support.</p>
      `;
      break;
  }

  await sendEmail({ to: email, subject, html });
};
