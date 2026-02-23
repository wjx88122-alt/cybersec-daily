import nodemailer from "nodemailer";
import { verificationTemplate } from "./templates/verification";
import { passwordResetTemplate } from "./templates/password-reset";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: "onboarding@resend.dev",
    to,
    subject: "請驗證你的 Email",
    html: verificationTemplate(link),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: "onboarding@resend.dev",
    to,
    subject: "重設你的密碼",
    html: passwordResetTemplate(link),
  });
}
