import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodeMailer.createTransport({
  service: 'gmail', // or any SMTP provider
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendPaymentNotificationEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Hotel" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    });
    console.log("📨 Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};
