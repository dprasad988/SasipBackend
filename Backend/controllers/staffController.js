import db from '../db.js';
import { fileURLToPath } from 'url';
import { uploadFileToSFTP, deleteFileFromSFTP } from '../ftpUpload.js';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllMembers = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Members');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createMember = async (req, res) => {
    const { name, role, contact, rank, status } = req.body;
    let imageUrl = null;

    if (req.files && req.files['image'] && req.files['image'][0]) {
        try {
            const fileBuffer = req.files['image'][0].buffer;
            const remoteFileName = req.files['image'][0].originalname;
            imageUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }
    }

    try {
        const [results] = await db.query(
            'INSERT INTO Members (image, name, role, contact, rank, status) VALUES (?, ?, ?, ?, ?, ?)',
            [imageUrl, name, role, contact, rank, status]
        );
        res.status(201).json({ sid: results.insertsid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMember = async (req, res) => {
    const { sid } = req.params;
    const { name, role, contact, rank, status } = req.body;
    let imageUrl = null;

    // Handle image upload if provided
    if (req.files && req.files['image'] && req.files['image'][0]) {
        try {
            const fileBuffer = req.files['image'][0].buffer;
            const remoteFileName = req.files['image'][0].originalname;
            imageUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }
    } else if (req.body.imageUrl) {
        // Use existing image URL if provided
        imageUrl = req.body.imageUrl;
    }

    try {
        await db.query(
            'UPDATE Members SET image = ?, name = ?, role = ?, contact = ?, rank = ?, status = ? WHERE sid = ?',
            [imageUrl, name, role, contact, rank, status, sid]
        );
        res.json({ message: 'Member updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteMember = async (req, res) => {
    const { sid } = req.params;

    try {
        const [rows] = await db.query('SELECT image FROM Members WHERE sid = ?', [sid]);
        const member = rows[0];

        if (member && member.image) {
            try {
                await deleteFileFromSFTP(member.image);
            } catch (error) {
                return res.status(500).json({ error: 'Failed to delete image from SFTP server' });
            }
        }

        await db.query('DELETE FROM Members WHERE sid = ?', [sid]);
        res.json({ message: 'Member deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
