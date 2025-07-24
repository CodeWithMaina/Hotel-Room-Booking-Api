import nodemailer from "nodemailer";

interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export const sendEmailToSupport = async (data: ContactMessagePayload) => {
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
      <h2 style="color: #1e40af;">📩 New Contact Message from StayCloud</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Message:</strong></p>
      <div style="background: #f9f9f9; padding: 1em; border-radius: 8px; border: 1px solid #ddd;">
        ${message.replace(/\n/g, "<br />")}
      </div>
      <hr />
      <p style="font-size: 0.9em; color: #888;">This message was submitted via the StayCloud contact form.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${name} via StayCloud" <${process.env.EMAIL_SENDER}>`,
    to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    subject: `New Contact Message from ${name}`,
    html: htmlContent,
  });
};
