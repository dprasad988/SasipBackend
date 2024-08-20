// controllers/classTypeController.js
import db from '../db.js';

// Get all class types
const getAllClassTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ClassType');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get class type by ID
const getClassTypeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM ClassType WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ClassType not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new class type
const createClassType = async (req, res) => {
  const { rank, classType, status } = req.body;
  try {
    const [result] = await db.query('INSERT INTO ClassType (rank, classType, status) VALUES (?, ?, ?)', [rank, classType, status]);
    res.status(201).json({ id: result.insertId, rank, classType, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a class type
const updateClassType = async (req, res) => {
  const { id } = req.params;
  const { rank, classType, status } = req.body;
  try {
    const [result] = await db.query('UPDATE ClassType SET rank = ?, classType = ?, status = ? WHERE id = ?', [rank, classType, status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ClassType not found' });
    }
    res.json({ id, rank, classType, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a class type
const deleteClassType = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM ClassType WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ClassType not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllClassTypes,
  getClassTypeById,
  createClassType,
  updateClassType,
  deleteClassType,
};
