import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  authMethod: 'PLAIN'
});

export const sendContactEmail = async (name, email, subject, message) => {
    
  try {
    if (!name || !email || !subject || !message) {
      throw new Error('All fields are required');
    }

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Change this to your preferred recipient email
      subject: `Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br>${message}</p>
          <p style="font-size: 14px; color: #888;">This is an automated message sent from your contact form.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return { message: 'Contact form submitted successfully!' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

// Controller function to handle HTTP requests
export const contactController = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const response = await sendContactEmail(name, email, subject, message);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
