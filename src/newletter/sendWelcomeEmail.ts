import nodeMailer from "nodemailer";

export const sendWelcomeEmail = async (recipientEmail: string) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <table style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <thead style="background-color: #1e3a8a;">
        <tr>
          <td style="padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">StayCloud</h1>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Welcome to Our Newsletter! 🎉</h2>
            <p style="color: #555555; font-size: 14px; line-height: 1.6;">
              Thank you for subscribing to StayCloud! You’re now part of an exclusive group that receives our latest news, travel tips, hotel offers, and product updates — directly to your inbox.
            </p>
            <div style="margin: 20px 0; text-align: center;">
              <a href="https://yourdomain.com" target="_blank"
                 style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; font-size: 14px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Visit StayCloud →
              </a>
            </div>
            <p style="color: #777777; font-size: 12px; line-height: 1.6;">
              We promise not to spam you. You can unsubscribe at any time by clicking the link in our emails.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
            <p style="color: #999999; font-size: 12px;">
              &copy; ${new Date().getFullYear()} StayCloud. All rights reserved.<br />
              Nairobi, Kenya
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: '"StayCloud" <no-reply@yourdomain.com>',
    to: recipientEmail,
    subject: "🎉 Welcome to StayCloud!",
    html: htmlContent,
  });
};
