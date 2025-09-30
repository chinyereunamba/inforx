// Email service utility
// TODO: Implement with actual email service (Resend, SendGrid, etc.)

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Implement actual email sending
    console.log("Email would be sent:", {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${
    process.env.NEXTAUTH_URL
  }/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #0A9396;">Verify Your Email Address</h2>
      <p>Thank you for registering with InfoRx. Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #0A9396; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This link will expire in 24 hours. If you didn't create an account with InfoRx, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
    Verify Your Email Address
    
    Thank you for registering with InfoRx. Please visit the following link to verify your email address:
    
    ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create an account with InfoRx, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email Address - InfoRx",
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${
    process.env.NEXTAUTH_URL
  }/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #0A9396;">Reset Your Password</h2>
      <p>You requested a password reset for your InfoRx account. Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #0A9396; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
    Reset Your Password
    
    You requested a password reset for your InfoRx account. Please visit the following link to reset your password:
    
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - InfoRx",
    html,
    text,
  });
}
