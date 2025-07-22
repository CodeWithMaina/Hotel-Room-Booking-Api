import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const getEmailConfig = (): EmailConfig => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || 
      !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Missing email configuration in environment variables");
  }

  return {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

export const sendContactEmail = async (
  name: string,
  email: string,
  message: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport(getEmailConfig());

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_FROM || email}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Contact Form Submission</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};