import * as Brevo from '@getbrevo/brevo';
import { getVerifyEmailHtml } from './templates/verifyEmailTemplate.js';
import { getResetPasswordHtml } from './templates/resetPasswordTemplate.js';

let apiInstance = null;

function getApiInstance() {
  if (!apiInstance) {
    const client = Brevo.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    apiInstance = new Brevo.TransactionalEmailsApi();
  }
  return apiInstance;
}

/**
 * Send a transactional email via the Brevo (SendInBlue) API.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML body content
 * @returns {Promise<void>}
 */
export async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY) {
    console.warn(
      '[emailService] BREVO_API_KEY is not set — email not sent via Brevo.'
    );
    return;
  }

  const senderEmail = process.env.EMAIL_FROM || 'noreply@medportal.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'MedPortal';

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const api = getApiInstance();
    await api.sendTransacEmail(sendSmtpEmail);
    console.log(`[emailService] Email sent to ${to} — subject: "${subject}"`);
  } catch (err) {
    console.error(
      `[emailService] Failed to send email to ${to}:`,
      err?.response?.body || err.message
    );
    throw err;
  }
}

/**
 * Send verification email to a newly signed up user.
 *
 * @param {string} userEmail - User's email
 * @param {string} userName - User's name
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(userEmail, userName, token) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const html = getVerifyEmailHtml(userName, verificationUrl);

  console.log(
    `[verificationEmail] Generated verification link for ${userEmail}: ${verificationUrl}`
  );
  await sendEmail(userEmail, 'Verify Your Email Address - MedPortal', html);
}

/**
 * Send password reset email to a user.
 *
 * @param {string} userEmail - User's email
 * @param {string} userName - User's name
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(userEmail, userName, token) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const html = getResetPasswordHtml(userName, resetUrl);

  console.log(
    `[passwordResetEmail] Generated reset link for ${userEmail}: ${resetUrl}`
  );
  await sendEmail(userEmail, 'Reset Your Password - MedPortal', html);
}
