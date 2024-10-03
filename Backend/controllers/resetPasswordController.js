import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).send('Token and new password are required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (error) {
      return res.status(400).send('Invalid or expired token');
    }

    const { email } = decoded;

    // Find the user in the database
    const [rows] = await pool.query('SELECT * FROM Admin WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    // Update the user's password
    await pool.query('UPDATE Admin SET password = ? WHERE email = ?', [password, email]);

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
};
