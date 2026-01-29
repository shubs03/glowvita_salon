import nodemailer from 'nodemailer';

/**
 * Send an email using SMTP transport
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email (optional)
 * @param {string} options.text - Plain text content of the email (optional)
 * @param {Array} options.attachments - Array of attachment objects
 * @returns {Promise<Object>} - Result of the email sending operation
 */
export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  try {
    console.log('Attempting to send email to:', to);

    // Check if required environment variables are present
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration in environment variables');
      return { success: false, error: 'Missing SMTP configuration' };
    }

    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      user: process.env.SMTP_USER
    });

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Only for development, should be true in production
      }
    });

    console.log('Created transporter, verifying connection...');

    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Prepare email options
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
    };

    // Add HTML or text content
    if (html) {
      mailOptions.html = html;
    } else if (text) {
      mailOptions.text = text;
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}