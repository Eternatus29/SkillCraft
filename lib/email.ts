import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"SkillCraft" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  })
}

export function otpEmailHtml(otp: string, name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color: #7c3aed;">Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; margin: 24px 0;">
        ${otp}
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `
}

export function passwordResetEmailHtml(resetUrl: string, name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color: #7c3aed;">Reset your password</h2>
      <p>Hi ${name},</p>
      <p>Click the button below to reset your password. The link expires in <strong>15 minutes</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
        Reset Password
      </a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `
}

export function enrollmentEmailHtml(courseName: string, name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color: #7c3aed;">You're enrolled!</h2>
      <p>Hi ${name},</p>
      <p>Congratulations! You have successfully enrolled in <strong>${courseName}</strong>.</p>
      <p>Happy learning!</p>
    </div>
  `
}
