import pool from "../db.js"; 



// Get all years
export const getAllYears = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM YearTable');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a year by ID
export const getYearById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM YearTable WHERE yid = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Year not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new year
export const createYear = async (req, res) => {
    const { year, class_type, rank, status } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO YearTable (year, class_type, rank, status) VALUES (?, ?, ?, ?)',
            [year, class_type, rank, status]
        );
        res.status(201).json({ id: result.insertId, year, class_type, rank, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a year
export const updateYear = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    
    const { year, class_type, rank, status } = req.body;
    console.log(req.body);
    
    try {
        const [result] = await pool.query(
            'UPDATE YearTable SET year = ?, class_type = ?, rank = ?, status = ? WHERE yid = ?',
            [year, class_type, rank, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Year not found' });
        }

        res.status(200).json({ id, year, class_type, rank, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a year
export const deleteYear = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await pool.query('DELETE FROM YearTable WHERE yid = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Year not found' });
        }

        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
