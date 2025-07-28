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
  <div style="font-family: 'Inter', sans-serif; background-color: #f2f2f2; padding: 2rem;">
    <table style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      <thead style="background-color: #007bff; color: #ffffff;">
        <tr>
          <th style="padding: 1.5rem; font-size: 1.5rem; font-family: 'Playfair Display', serif; text-align: center;">
            📩 New Contact Message – StayCloud
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 2rem; color: #343a40;">
            <p style="margin: 0 0 1rem;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 1rem;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
            <p style="margin: 1.5rem 0 0.5rem;"><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 1rem; border-left: 4px solid #fca311; border-radius: 5px; margin-top: 0.5rem;">
              <p style="margin: 0; color: #6c757d;">${message.replace(/\n/g, "<br />")}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 1rem 2rem; font-size: 0.9rem; color: #6c757d; border-top: 1px solid #dee2e6;">
            <p style="margin: 0;">This message was submitted via the StayCloud contact form.</p>
            <p style="margin: 0;">Please respond to <a href="mailto:${email}" style="color: #007bff; text-decoration: underline;">${email}</a> if follow-up is needed.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: `"${name} via StayCloud" <${process.env.EMAIL_SENDER}>`,
    to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    subject: `📬 New Contact Message from ${name}`,
    html: htmlContent,
  });
};
