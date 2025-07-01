import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

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

  const mailOptions = {
    from: `"Hotel Service" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: subject,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; padding: 20px; text-align: center; }
        .header img { max-width: 150px; }
        .content { padding: 30px; background-color: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="color: white; margin: 0;">Hotel Service</h1>
      </div>
      
      <div class="content">
        <h2 style="margin-top: 0;">${subject}</h2>
        
        <p>Hello ${fullName || 'there'},</p>
        
        <p>${message}</p>
        
        ${actionLink && actionText ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionLink}" class="button">${actionText}</a>
        </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <p>If you didn't request this, please ignore this email.</p>
        
        <p>Best regards,<br>The Hotel Service Team</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Service. All rights reserved.</p>
        <p>123 Hotel Street, City, Country</p>
      </div>
    </body>
    </html>
    `,
  };

  try {
    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse.accepted.length > 0;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};