import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
  throw new Error('Email configuration is missing. Please set EMAIL_SENDER and EMAIL_PASSWORD in environment variables.');
}

export const sendNotificationEmail = async (
  email: string,
  subject: string,
  fullName: string | null,
  message: string,
  actionLink?: string,
  actionText?: string
) => {
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
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;font-family:Segoe UI,Roboto,sans-serif;background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#1e3a8a;padding:30px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;">Hotel Service</h1>
              </td>
            </tr>
            
            <!-- Body Content -->
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 10px 0;color:#333333;font-size:20px;">${subject}</h2>
                <p style="color:#555555;font-size:14px;line-height:1.6;">Hello ${fullName || 'there'},</p>
                <p style="color:#555555;font-size:14px;line-height:1.6;">${message}</p>

                ${
                  actionLink && actionText
                    ? `
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${actionLink}" target="_blank" style="background-color:#1e3a8a;color:#ffffff;padding:12px 24px;font-size:14px;text-decoration:none;border-radius:4px;display:inline-block;">
                      ${actionText}
                    </a>
                  </div>
                `
                    : ''
                }

                <p style="color:#777777;font-size:13px;line-height:1.6;">
                  If you didn't request this, you can safely ignore this email.
                </p>

                <p style="color:#555555;font-size:14px;line-height:1.6;margin-top:30px;">
                  Best regards,<br />
                  <strong>The Hotel Service Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280;">
                <p style="margin:4px 0;">&copy; ${new Date().getFullYear()} Hotel Service. All rights reserved.</p>
                <p style="margin:4px 0;">123 Hotel Street, Nairobi, Kenya</p>
                <p style="margin:8px 0;"><small>This is an automated message, please do not reply directly.</small></p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"Hotel Service" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    const mailResponse = await transporter.sendMail(mailOptions);
    if (!mailResponse.accepted || mailResponse.accepted.length === 0) {
      console.error('Email not accepted by server:', mailResponse);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        code: (error as any).code,
        response: (error as any).response,
        responseCode: (error as any).responseCode,
      });
    }
    return false;
  }
};
