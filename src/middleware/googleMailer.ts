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

  const mailOptions = {
    from: `"Hotel Service" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: subject,
html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    /* Add responsive styles and better fallbacks */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .header {
      background-color: #2563eb;
      padding: 25px 20px;
      text-align: center;
    }
    .content {
      padding: 30px;
      background-color: #f9fafb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 15px 0;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      background-color: #f3f4f6;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px;
      }
    }
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
    <div style="text-align: center;">
      <a href="${actionLink}" class="button" style="color: white;">${actionText}</a>
    </div>
    ` : ''}
    
    <p>If you didn't request this, please ignore this email.</p>
    
    <p>Best regards,<br>The Hotel Service Team</p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} Hotel Service. All rights reserved.</p>
    <p>123 Hotel Street, City, Country</p>
    <p><small>This is an automated message - please do not reply directly to this email.</small></p>
  </div>
</body>
</html>
`,
  };

  // Replace the current try-catch with more detailed error handling
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