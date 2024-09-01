import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  
  },
  authMethod: 'PLAIN'
});

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).send('Email is required');
    }

    const [rows] = await pool.query('SELECT * FROM Admin WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '5m' });
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <img src="https://pub-static.fotor.com/assets/text_to_image/demos/ai-face/6.png" alt="Company Logo" style="width: 150px; height: auto; margin-bottom: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.6;">Dear Admin,</p>
          <p style="font-size: 16px; line-height: 1.6;">You have requested to reset your password. Please use the following link to complete the process:</p>
          <p style="font-size: 18px; line-height: 1.6;">Click <a href="${resetLink}" style="color: #1a73e8;">here</a> to reset your password.</p>
          <p style="font-size: 16px; line-height: 1.6;">If you did not request this password reset, please ignore this email.</p>
          <p style="font-size: 16px; line-height: 1.6;">Regards,<br>Copyright © Sasip.lk 2024</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Password reset link has been sent to your email' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
};
