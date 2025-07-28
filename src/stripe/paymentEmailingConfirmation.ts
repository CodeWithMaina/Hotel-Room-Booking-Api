import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { bookings } from "../drizzle/schema";

// Utility: Generate a styled, branded HTML email template
const generateEmailTemplate = (
  title: string,
  greeting: string,
  body: string,
  footer: string,
  primaryAction?: { text: string; url: string }
) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter&family=Playfair+Display&display=swap" rel="stylesheet" />
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f2f2f2;
          margin: 0;
          padding: 0;
          color: #343a40;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          padding: 32px;
        }
        h2 {
          font-family: 'Playfair Display', serif;
          color: #007bff;
          margin-top: 0;
        }
        p {
          line-height: 1.6;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          margin-top: 24px;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #0056b3;
        }
        .footer {
          margin-top: 40px;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${title}</h2>
        <p>${greeting}</p>
        ${body}
        ${
          primaryAction
            ? `<a href="${primaryAction.url}" class="button">${primaryAction.text}</a>`
            : ""
        }
        <p class="footer">${footer}</p>
      </div>
    </body>
  </html>
  `;
};

// Email sender
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

  const clientURL = process.env.FRONTEND_URL || "https://stay-cloud-rooms.netlify.app/";

  switch (type) {
    case "success":
      subject = "✅ Payment Successful";
      html = generateEmailTemplate(
        "Payment Received",
        `Hi ${firstName},`,
        `<p>Your payment for your Booking was successful.</p>
         <p><strong>Amount Paid:</strong> ${formatAmount(amount)}</p>
         <p>We'll confirm your booking shortly.</p>`,
        "Thank you for choosing our service!",
        { text: "View Payment", url: `${clientURL}user/payment` }
      );
      break;

    case "confirmation":
      subject = "🏨 Booking Confirmed";
      html = generateEmailTemplate(
        "Your Booking is Confirmed",
        `Hi ${firstName},`,
        `<p>Booking has been successfully confirmed.</p>
         <p><strong>Transaction ID:</strong> ${transactionId}</p>`,
        "We look forward to hosting you.",
        { text: "Check Itinerary", url: `${clientURL}user/booking-details` }
      );
      break;

    case "failure":
      subject = "❌ Payment Failed";
      html = generateEmailTemplate(
        "Payment Failed",
        `Hi ${firstName},`,
        `<p>Your payment for the Booking failed.</p>
         <p><strong>Amount To Be Paid:</strong> ${formatAmount(amount)}</p>
         <p>Please try again or contact support if the issue persists.</p>`,
        "Need help? We're here for you.",
        { text: "Retry Payment", url: `${clientURL}user/payment` }
      );
      break;
  }

  await sendEmail({ to: email, subject, html });
};
