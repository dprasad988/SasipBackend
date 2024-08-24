import connection from "../db.js";

export const createVideo = async (req, res) => {
    const { lid, videoUrl, pdfUrl, rank, status } = req.body;
    const query = 'INSERT INTO Videos (lid, videoUrl, pdfUrl, rank, status) VALUES (?, ?, ?, ?, ?)';

    try {
        const [results] = await connection.execute(query, [lid, videoUrl, pdfUrl, rank, status]);
        res.status(201).json({ message: 'Video created successfully', videoId: results.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read Videos
export const getVideos = async (req, res) => {
    const query = 'SELECT * FROM Videos';

    try {
        const [results] = await connection.execute(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read Single Video
export const getVideoById = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Videos WHERE vid = ?';

    try {
        const [results] = await connection.execute(query, [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.status(200).json(results[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Video
export const updateVideo = async (req, res) => {
    const { id } = req.params;
    const { lid, videoUrl, pdfUrl, rank, status } = req.body;
    const query = 'UPDATE Videos SET lid = ?, videoUrl = ?, pdfUrl = ?, rank = ?, status = ? WHERE vid = ?';

    try {
        const [results] = await connection.execute(query, [lid, videoUrl, pdfUrl, rank, status, id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.status(200).json({ message: 'Video updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Video
export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Videos WHERE vid = ?';

    try {
        const [results] = await connection.execute(query, [id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
