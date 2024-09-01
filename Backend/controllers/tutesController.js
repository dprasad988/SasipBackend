import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFileToSFTP } from '../ftpUpload.js';
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new tute
export const createTute = async (req, res) => {
  const { title, subtitle, description, status, lid } = req.body;

  console.log('Creating Tute:', req.body);

  let coverPhotoUrl = null;

  try {
    // Handle cover photo upload
    const coverPhotoFile = req.files.find(file => file.fieldname === 'coverPhoto');
    if (coverPhotoFile) {
      coverPhotoUrl = await uploadFileToSFTP(coverPhotoFile.buffer, coverPhotoFile.originalname);
    }

    // Insert into tutes table
    const [result] = await pool.query(
      `INSERT INTO tutes (title, subtitle, cover_photo, description, status, lid) VALUES (?, ?, ?, ?, ?, ?)`,
      [title || null, subtitle || null, coverPhotoUrl || null, description || null, status || null, lid]
    );

    const tuteId = result.insertId;

    res.status(201).json({ tuteId });
  } catch (error) {
    console.error('Error creating tute:', error);
    res.status(500).send(`Error creating tute: ${error.message}`);
  }
};

// Update an existing tute
export const updateTute = async (req, res) => {
  const { id } = req.params;
  const { title = '', subtitle = '', description = '', status = '' } = req.body;

  console.log('Updating Tute:', req.body);

  try {
    let coverPhotoUrl = null;

    const coverPhotoFile = req.files.find(file => file.fieldname === 'coverPhoto');
    if (coverPhotoFile) {
      coverPhotoUrl = await uploadFileToSFTP(coverPhotoFile.buffer, coverPhotoFile.originalname);
    }

    const updateQuery = `
      UPDATE tutes SET 
        title = COALESCE(?, title), 
        subtitle = COALESCE(?, subtitle), 
        cover_photo = COALESCE(?, cover_photo), 
        description = COALESCE(?, description), 
        status = COALESCE(?, status),
        lid
      WHERE id = ?`;

    const updateValues = [
      title,
      subtitle,
      coverPhotoUrl,
      description,
      status,
      lid
    ];

    await pool.query(updateQuery, updateValues);

    res.status(200).json({ message: 'Tute updated successfully' });
  } catch (error) {
    console.error('Error updating tute:', error);
    res.status(500).send(`Error updating tute: ${error.message}`);
  }
};

// Delete a tute
export const deleteTute = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  try {
    await pool.query("DELETE FROM tutes WHERE tute_id = ?", [id]);
    res.status(200).send("Tute deleted");
  } catch (error) {
    console.error('Error deleting tute:', error);
    res.status(500).send(`Error deleting tute: ${error.message}`);
  }
};

// Get all tutes
export const getAllTutes = async (req, res) => {
  try {
    // Query to get tutes
    const query = `
      SELECT 
        tute_id,
        title,
        subtitle,
        cover_photo,
        description,
        status,
        lid
      FROM 
        tutes
    `;

    const [rows] = await pool.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving tutes:', error);
    res.status(500).send(`Error retrieving tutes: ${error.message}`);
  }
};
