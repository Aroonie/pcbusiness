// This is a Vercel Serverless Function.
// It will live at the URL /api/submit-form

export default function handler(request, response) {
  // We only want to handle POST requests to this function.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get the form data from the request body.
  const { name, email, subject, message } = request.body;

  // --- Server-side validation ---
  if (!name || !email || !subject || !message) {
    return response.status(400).json({ message: 'All fields are required.' });
  }

  // --- Honeypot check ---
  // If the 'website' field (our honeypot) is filled out, it's a bot.
  if (request.body.website) {
    console.log('Honeypot field filled, likely a bot.');
    // Silently succeed to not alert the bot.
    return response.status(200).json({ message: 'Message sent successfully!' });
  }

  // --- Email Sending Logic ---
  // In a real application, you would use a service like SendGrid, Resend, or Nodemailer here.
  // For this example, we'll just log the data to the Vercel console and simulate success.
  
  console.log('--- New Form Submission ---');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Subject:', subject);
  console.log('Message:', message);
  console.log('--------------------------');

  // You would replace the above console logs with your email sending code.
  // For example, using Resend: await resend.emails.send({...});

  // Send a success response back to the frontend.
  response.status(200).json({ message: 'Thank you! Your message has been received.' });
}