import nodemailer from "nodemailer";

interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export const sendConfirmationEmailToUser = async (data: ContactMessagePayload) => {
  const { name, email, message } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #1e40af;">✅ Message Received</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for contacting <strong>StayCloud</strong>. We've received your message and our support team will get back to you shortly.</p>
      <p><strong>Your message:</strong></p>
      <div style="background: #f9f9f9; padding: 1em; border-radius: 8px; border: 1px solid #ddd;">
        ${message.replace(/\n/g, "<br />")}
      </div>
      <br />
      <p>Meanwhile, feel free to explore more about our platform or reach out for anything urgent.</p>
      <hr />
      <p style="font-size: 0.9em; color: #888;">This is an automated confirmation from StayCloud.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"StayCloud" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: "📬 We’ve received your message at StayCloud",
    html: htmlContent,
  });
};
