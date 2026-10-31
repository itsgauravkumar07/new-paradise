const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Paradise Yatra" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Admin Password Reset OTP - Paradise Yatra",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0084ff;">Paradise Yatra</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="font-size: 16px; color: #333;">We received a request to reset your Paradise Yatra admin password.Use the following OTP to continue:</p>
          <h2 style="font-size: 36px; letter-spacing: 5px; color: #0084ff; margin: 20px 0;">${otp}</h2>
          <p style="font-size: 14px; color: #666;">This code is valid for 5 minutes. Please do not share this OTP with anyone.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Paradise Yatra. All rights reserved.</p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.verify();
        let info = await transporter.sendMail(mailOptions);
        
        console.log("Message sent to %s: %s", email, info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        return { success: true };
    } catch (error) {
        console.error("Email sending error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
};
