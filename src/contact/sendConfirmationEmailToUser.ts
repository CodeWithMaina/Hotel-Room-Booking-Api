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
  <div style="font-family: 'Inter', sans-serif; background-color: #f2f2f2; padding: 2rem;">
    <table style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      <thead style="background-color: #007bff; color: #ffffff;">
        <tr>
          <th style="padding: 1.5rem; font-size: 1.75rem; font-family: 'Playfair Display', serif; text-align: center;">
            ✅ StayCloud Confirmation
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 2rem; color: #343a40;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">Hi <strong>${name}</strong>,</p>
            <p style="margin-bottom: 1rem;">Thank you for reaching out to <strong>StayCloud</strong>. We've received your message and our support team will get back to you as soon as possible.</p>
            <p><strong>Your message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 1rem; border-left: 4px solid #fca311; border-radius: 5px; margin: 1rem 0;">
              <p style="margin: 0; color: #6c757d;">${message.replace(/\n/g, "<br />")}</p>
            </div>
            <p style="margin-top: 2rem;">Meanwhile, feel free to explore our platform or reach out for anything urgent.</p>
            <div style="margin-top: 2rem; text-align: center;">
              <a href="https://staycloud.com" style="background-color: #fca311; color: #ffffff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; display: inline-block;">Explore StayCloud</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 1rem 2rem; font-size: 0.9rem; color: #6c757d; border-top: 1px solid #dee2e6;">
            <p style="margin: 0;">This is an automated confirmation email from StayCloud.</p>
            <p style="margin: 0;">If you didn’t make this request, please ignore this email.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: `"StayCloud" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: "📬 We’ve received your message at StayCloud",
    html: htmlContent,
  });
};
