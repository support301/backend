import transporter from "../config/emailConfig.js";
import EmailVerificationModel from "../models/EmailVerification.js";
const sendEmailVerificationOTP = async (req, user) => {

    const otp = Math.floor(1000 + Math.random() * 900000);

    //save otp in db
    await new EmailVerificationModel({ userId: user._id, otp: otp }).save();

    const otpVerificationLink = `${process.env.FRONTEND_HOST}/auth/verify-email`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Pro Ace Academy --- Email Verification",
        html: `  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>Hi ${user.name},</p>

    <p>Welcome to <strong>Pro Ace Academy</strong> — we're excited to have you on board!</p>

    <p>Your one-time verification code (OTP) is:</p>
    <h2 style="color: #2c3e50;">${otp}</h2>

    <p>This OTP is valid for <strong>15 minutes</strong> only, so please verify your email as soon as possible.</p>

    <p>You can enter your OTP by clicking the link below:</p>
    <p><a href="${otpVerificationLink}" style="color: #1a73e8;">Verify Now</a></p>


    <p>If you need any assistance, feel free to reach out to our support team at 
    <a href="mailto:support@proaceacademy.com">support@proaceacademy.com</a>.</p>

    <p>Best regards,<br/>The Pro Ace Academy Team</p>
  </div>`
    })

    return otp
}

export default sendEmailVerificationOTP;