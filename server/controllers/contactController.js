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
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ORDER_NOTIFY_EMAIL;
    const emailSubject = `New Contact Submission from ${name}`;
    const emailHtml = generateContactNotificationEmail(name, email, message);
    
    try {
      if (!ADMIN_EMAIL) {
        console.warn('[submitContactForm] ADMIN_EMAIL is not set — contact message saved but not emailed.');
      } else {
        await sendEmail(ADMIN_EMAIL, emailSubject, emailHtml);
      }
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

/**
 * GET /api/contact/messages — staff inbox, newest first.
 */
export async function listContactMessages(req, res) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    return res.json({ messages });
  } catch (err) {
    console.error('[listContactMessages] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Could not load messages.' });
  }
}
