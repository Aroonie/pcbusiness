// This is a Vercel Serverless Function.
// It will live at the URL /api/submit-form
import nodemailer from 'nodemailer';
import { promises as dns } from 'dns';

/**
 * A simple utility to escape HTML characters.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escape[match];
  });
}

export default async function handler(request, response) {
  // We only want to handle POST requests to this function.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get the form data from the request body.
  const { name, email, subject, message, website } = request.body;

  // --- Check for required environment variables ---
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing email credentials in environment variables.');
    return response.status(500).json({ message: 'Server configuration error.' });
  }

  // --- Server-side validation ---
  if (!name || !email || !subject || !message) {
    return response.status(400).json({ message: 'All fields are required.' });
  }

  // --- Honeypot check ---
  if (website) {
    console.log('Honeypot field filled, likely a bot.');
    return response.status(200).json({ message: 'Message sent successfully!' });
  }

  // --- Email format validation ---
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ message: 'Invalid email format.' });
  }

  // --- MX Record DNS Check for Email Domain ---
  try {
    const domain = email.split('@')[1];
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) {
      // No MX records means the domain can't receive email.
      throw new Error('Invalid email domain.');
    }
  } catch (error) {
    console.error('Email domain validation error:', error.message);
    // This catches domains that don't exist or have no MX records.
    return response.status(400).json({ message: 'The provided email address is not valid.' });
  }

  // Sanitize name for the 'from' field to prevent header issues.
  const sanitizedName = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();

  // Create a transporter object using SMTP transport.
  // You must use environment variables for security.
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // For Gmail, this should be an "App Password"
    },
  });

  // Define the email options
  const mailOptions = {
    from: `"${sanitizedName}" <${process.env.EMAIL_USER}>`, // Use sanitized name
    to: 'support@aroonierepairs.test', // Your receiving email address
    replyTo: email, // Reply-to the user's email
    subject: `New Contact Form Submission: ${subject}`,
    text: `You have a new submission from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `<p>You have a new submission from:</p><ul><li><strong>Name:</strong> ${escapeHTML(name)}</li><li><strong>Email:</strong> <a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a></li></ul><p><strong>Message:</strong></p><p>${escapeHTML(message)}</p>`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    // Send a success response back to the frontend.
    response.status(200).json({ message: 'Thank you! Your message has been received.' });
  } catch (error) {
    console.error('Nodemailer error:', error.message);
    // Send an error response
    response.status(500).json({ message: 'Sorry, there was an error sending your message.' });
  }
}