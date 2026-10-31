import nodemailer from 'nodemailer';

// Configure the email transporter
// Make sure to add EMAIL_USER and EMAIL_PASSWORD to your .env.local file
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to 'smtp' or other services like SendGrid/AWS SES
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use an App Password if using Gmail
  },
});

/**
 * Sends an OTP email to the specified user email address
 * @param to - The recipient's email address
 * @param otp - The generated One-Time Password
 */
export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"Paradise Yatra" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification Code - Paradise Yatra',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaeb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #000945; margin: 0; font-size: 28px;">Paradise Yatra</h2>
          <p style="color: #666; font-size: 14px; margin-top: 5px;">Your Gateway to Paradise</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Here is your One-Time Password (OTP) for verification. Please use it to complete your action. This code is valid for <strong>10 minutes</strong>.</p>
        
        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px dashed #ccc;">
          <strong style="font-size: 36px; letter-spacing: 8px; color: #0ea5e9;">${otp}</strong>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.5;">If you didn't request this code, you can safely ignore this email. Someone might have typed your email address by mistake.</p>
        
        <hr style="border: none; border-top: 1px solid #eaeaeb; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Paradise Yatra. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
};
