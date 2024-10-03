// controllers/formController.js

import db from '../db.js';

// Get all form entries
export const getAllEntries = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM FormEntries');
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new form entry
export const createEntry = async (req, res) => {
    const { title, google_form_link, status } = req.body;
    

    try {
        const [result] = await db.query(
            'INSERT INTO FormEntries (title, google_form_link, status) VALUES (?, ?, ?)',
            [title, google_form_link, status]
        );
        res.status(201).json({ id: result.insertId, title, google_form_link, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update an existing form entry
export const updateEntry = async (req, res) => {
    const { id } = req.params;
    const { title, google_form_link, status } = req.body;
    

    try {
        const [result] = await db.query(
            'UPDATE FormEntries SET title = ?, google_form_link = ?, status = ? WHERE fid = ?',
            [title, google_form_link, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.status(200).json({ message: 'Entry updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a form entry
export const deleteEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM FormEntries WHERE fid = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
