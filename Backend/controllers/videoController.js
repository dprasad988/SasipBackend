import connection from "../db.js";
import { uploadFileToSFTP } from '../ftpUpload.js';
import path from 'path';

export const createVideo = async (req, res) => {
    const { lid, videoUrl, title, description, status } = req.body;
    let pdfUrl = null;

    try {
        if (req.file) {
            const pdfFile = req.file;

            const timestamp = Date.now();
            const extension = path.extname(pdfFile.originalname);
            const uniqueFilename = `${timestamp}${extension}`;
            
            pdfUrl = await uploadFileToSFTP(pdfFile.buffer, uniqueFilename);
        }

        const query = 'INSERT INTO Videos (lid, videoUrl, title, description, pdfUrl, status) VALUES (?, ?, ?, ?, ?, ?)';
        const [results] = await connection.execute(query, [lid, videoUrl, title, description, pdfUrl, status]);

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
    const { lid } = req.params;
    const query = 'SELECT * FROM Videos WHERE lid = ?';

    try {
        const [results] = await connection.execute(query, [lid]);
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
    const { lid, videoUrl, title, description, status } = req.body;
    
    let pdfUrl = null;

    try {
        // Handle the PDF file upload if provided
        if (req.file) {
            const pdfFile = req.file;

            const timestamp = Date.now();
            const extension = path.extname(pdfFile.originalname);
            const uniqueFilename = `${timestamp}${extension}`;
            
            pdfUrl = await uploadFileToSFTP(pdfFile.buffer, uniqueFilename);
        }

        // If no new PDF file is provided, retain the existing pdfUrl
        const existingVideoQuery = 'SELECT pdfUrl FROM Videos WHERE vid = ?';
        const [existingVideoResults] = await connection.execute(existingVideoQuery, [id]);
        const existingVideo = existingVideoResults[0];
        if (!pdfUrl) {
            pdfUrl = existingVideo.pdfUrl;
        }

        const query = 'UPDATE Videos SET lid = ?, videoUrl = ?, title = ?, description = ?, pdfUrl = ?, status = ? WHERE vid = ?';
        const [results] = await connection.execute(query, [lid, videoUrl, title, description, pdfUrl, status, id]);

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
