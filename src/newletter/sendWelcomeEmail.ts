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
  <div style="font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; background-color: #f2f2f2; padding: 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.07);">
      <thead style="background-color: #007bff;">
        <tr>
          <td style="padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-family: 'Playfair Display', serif; margin: 0;">StayCloud</h1>
            <p style="color: #f2f2f2; font-size: 14px; margin: 0;">Where Comfort Meets the Cloud</p>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 30px;">
            <h2 style="color: #343a40; font-size: 20px; margin-bottom: 16px;">🎉 Welcome Aboard!</h2>
            <p style="color: #6c757d; font-size: 14px; line-height: 1.6;">
              We're thrilled to have you join the StayCloud community! Get ready to explore exclusive hotel deals, curated travel inspiration, and early access to our newest features.
            </p>
            <ul style="padding-left: 20px; color: #343a40; font-size: 14px; margin-top: 20px;">
              <li>✨ Premium hotel discounts</li>
              <li>📍 Personalized location-based recommendations</li>
              <li>🧳 Travel tips & curated guides</li>
            </ul>
            <div style="margin: 25px 0; text-align: center;">
              <a href="https://yourdomain.com" target="_blank"
                style="background-color: #fca311; color: #ffffff; padding: 12px 30px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                Explore StayCloud →
              </a>
            </div>
            <p style="color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
              No spam — ever. Unsubscribe anytime at the bottom of our emails.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f3f5; padding: 20px; text-align: center;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              Follow us:
            </p>
            <div style="margin: 10px 0;">
              <a href="https://facebook.com" style="margin: 0 6px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="20" style="vertical-align: middle;" />
              </a>
              <a href="https://twitter.com" style="margin: 0 6px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="20" style="vertical-align: middle;" />
              </a>
              <a href="https://instagram.com" style="margin: 0 6px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" width="20" style="vertical-align: middle;" />
              </a>
            </div>
            <p style="color: #999999; font-size: 12px; margin-top: 10px;">
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
