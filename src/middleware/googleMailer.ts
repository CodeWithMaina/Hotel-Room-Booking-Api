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
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;font-family:'Inter',Segoe UI,sans-serif;background-color:#f2f2f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background-color:#007bff;padding:30px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;font-family:'Playfair Display',serif;">🏨 Hotel Service</h1>
                </td>
              </tr>
              
              <!-- Body Content -->
              <tr>
                <td style="padding:30px 30px 10px;color:#343a40;">
                  <h2 style="margin:0 0 10px;font-size:20px;">${subject}</h2>
                  <p style="font-size:15px;line-height:1.6;margin:0;">Hello ${fullName || 'there'},</p>
                  <p style="font-size:15px;line-height:1.6;margin:16px 0;">${message}</p>

                  ${
                    actionLink && actionText
                      ? `
                      <div style="text-align:center;margin:30px 0;">
                        <a href="${actionLink}" target="_blank" style="background-color:#fca311;color:#ffffff;padding:12px 24px;font-size:15px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:500;">
                          ${actionText}
                        </a>
                      </div>
                    `
                      : ''
                  }

                  <p style="font-size:13px;line-height:1.5;color:#6c757d;">
                    If you didn’t request this, you can safely ignore this email.
                  </p>

                  <p style="margin-top:30px;font-size:15px;line-height:1.6;">
                    Warm regards,<br />
                    <strong>The Hotel Service Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#f2f2f2;padding:20px;text-align:center;font-size:12px;color:#6c757d;">
                  <p style="margin:4px 0;">&copy; ${new Date().getFullYear()} Hotel Service. All rights reserved.</p>
                  <p style="margin:4px 0;">123 Hotel Street, Nairobi, Kenya</p>
                  <p style="margin:8px 0;"><small>This is an automated message. Please do not reply directly.</small></p>
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
