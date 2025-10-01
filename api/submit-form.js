// This is a Vercel Serverless Function.
// It will live at the URL /api/submit-form
import { Resend } from 'resend';

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

  // --- Check for the required Resend API key ---
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing Resend API key in environment variables.');
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

  // Initialize Resend with your API key from environment variables
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Send the email using the Resend API
    await resend.emails.send({
      // IMPORTANT: The 'from' address must be a verified domain in Resend.
      // For testing, Resend provides 'onboarding@resend.dev'.
      from: 'Aroonie Repairs <onboarding@resend.dev>',
      to: ['your-actual-email@example.com'], // <-- CHANGE THIS to your real email address
      subject: `New Contact Form Submission: ${subject}`,
      reply_to: email,
      html: `<p>You have a new submission from:</p><ul><li><strong>Name:</strong> ${escapeHTML(name)}</li><li><strong>Email:</strong> ${escapeHTML(email)}</li></ul><p><strong>Message:</strong></p><p>${escapeHTML(message)}</p>`,
    });

    // Send a success response back to the frontend.
    response.status(200).json({ message: 'Thank you! Your message has been received.' });
  } catch (error) {
    console.error('Resend API error:', error);
    // Send an error response
    response.status(500).json({ message: 'Sorry, there was an error sending your message.' });
  }
}