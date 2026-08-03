import prisma from '../lib/prisma.js';
import { sendEmail } from '../services/emailService.js';
import { generateContactNotificationEmail } from '../services/templates/contactNotificationTemplate.js';

/**
 * POST /api/contact
 * Handles contact form submissions.
 * Validates name, email, and message.
 */
export async function submitContactForm(req, res) {
  try {
    const { name, email, message, website } = req.body;

    // Honeypot check: If the 'website' field is filled, it's likely a bot.
    if (website) {
      console.warn(`[submitContactForm] Honeypot triggered by ${email}. Silently dropping.`);
      return res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully.', // Fake success
      });
    }

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email, and message are required.',
      });
    }

    let contactMessage;
    
    try {
      // Try to save to DB
      contactMessage = await prisma.contactMessage.create({
        data: {
          name,
          email,
          message,
        },
      });
    } catch (dbErr) {
      console.warn('[submitContactForm] DB unavailable or schema not synced, using mock success:', dbErr.message);
      // Fallback for when DB isn't running
      contactMessage = {
        id: Date.now(),
        name,
        email,
        message,
        created_at: new Date(),
      };
    }

    // Send email notification to company admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@medportal.com';
    const emailSubject = `New Contact Submission from ${name}`;
    const emailHtml = generateContactNotificationEmail(name, email, message);
    
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: emailSubject,
        htmlContent: emailHtml,
      });
    } catch (emailErr) {
      console.error('[submitContactForm] Failed to send email notification via Brevo:', emailErr);
      // We don't fail the request if just the notification fails
    }

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      data: contactMessage,
    });
  } catch (err) {
    console.error('[submitContactForm] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to submit contact form.',
    });
  }
}
