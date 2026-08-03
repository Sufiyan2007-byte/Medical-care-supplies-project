/**
 * Generates an HTML email template for account verification.
 *
 * @param {string} name - User's name
 * @param {string} verificationUrl - Full URL with verification token
 * @returns {string} HTML email string
 */
export function getVerifyEmailHtml(name, verificationUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr style="background-color: #0284c7; text-align: center; padding: 24px;">
      <td style="padding: 24px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">MedPortal</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Healthcare & Surgical Equipment</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; color: #334155; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #0f172a;">Welcome, ${name}!</h2>
        <p>Thank you for signing up with MedPortal. Please verify your email address to activate your account and start exploring our catalog.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 14px; word-break: break-all;"><a href="${verificationUrl}" style="color: #0284c7;">${verificationUrl}</a></p>
        <p style="font-size: 14px; color: #64748b; margin-top: 24px;">This link will expire in 1 hour. If you didn't create an account, you can safely ignore this email.</p>
      </td>
    </tr>
    <tr style="background-color: #f1f5f9; text-align: center; padding: 16px;">
      <td style="padding: 16px; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} MedPortal. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
