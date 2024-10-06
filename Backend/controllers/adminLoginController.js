import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from "../db.js";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    // Use '?' as placeholders for parameters in MySQL
    const [rows] = await pool.query('SELECT * FROM Admin WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = rows[0];

    if (user.password === password) {
      const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '6h' });
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(401).send('Invalid password');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};
