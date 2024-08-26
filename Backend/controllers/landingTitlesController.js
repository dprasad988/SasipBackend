import db from '../db.js';

// Get all titles
export const getAllTitles = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Landing_Titles');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a title by ID
export const updateTitle = async (req, res) => {
    const { title, english_text, sinhala_text, status } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE Landing_Titles SET title = ?, english_text = ?, sinhala_text = ?, status = ? WHERE id = ?',
            [title, english_text, sinhala_text, status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Title not found' });
        }
        res.json({ message: 'Title updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
