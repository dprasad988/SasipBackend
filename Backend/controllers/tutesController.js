import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFileToSFTP } from '../ftpUpload.js';
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new tute
export const createTute = async (req, res) => {
  const { title, subtitle, description, status, lid } = req.body;

  let coverPhotoUrl = null;

  try {
    // Handle cover photo upload
    const coverPhotoFile = req.files.find(file => file.fieldname === 'coverPhoto');
    if (coverPhotoFile) {
      const filename = getTimestampedFilename(coverPhotoFile.originalname);
      coverPhotoUrl = await uploadFileToSFTP(coverPhotoFile.buffer, filename);
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

const getTimestampedFilename = (originalname) => {
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext);
  const timestamp = Date.now(); // Current timestamp in milliseconds
  return `${baseName}_${timestamp}${ext}`;
};

// Update an existing tute
export const updateTute = async (req, res) => {
  const { tute_id } = req.params;
  const { title = '', subtitle = '', description = '', status = '', lid = '' } = req.body;
  
  try {
    let coverPhotoUrl = null;

    if (req.files && req.files.length > 0) {
      const coverPhotoFile = req.files.find(file => file.fieldname === 'coverPhoto');
      if (coverPhotoFile) {
        const filename = getTimestampedFilename(coverPhotoFile.originalname);
        coverPhotoUrl = await uploadFileToSFTP(coverPhotoFile.buffer, filename);
      }
    }

    const updateQuery = `
      UPDATE tutes SET 
        title = COALESCE(?, title), 
        subtitle = COALESCE(?, subtitle), 
        cover_photo = COALESCE(?, cover_photo), 
        description = COALESCE(?, description), 
        status = COALESCE(?, status),
        lid = COALESCE(?, lid)
      WHERE tute_id = ?`;

    const updateValues = [
      title,
      subtitle,
      coverPhotoUrl,
      description,
      status,
      lid,
      tute_id
    ];

    const [result] = await pool.query(updateQuery, updateValues);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Tute updated successfully' });
    } else {
      res.status(404).json({ message: 'Tute not found' });
    }
  } catch (error) {
    console.error('Error updating tute:', error);
    res.status(500).send(`Error updating tute: ${error.message}`);
  }
};

// Delete a tute
export const deleteTute = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM tutes WHERE tute_id = ?", [id]);
    res.status(200).send("Tute deleted");
  } catch (error) {
    console.error('Error deleting tute:', error);
    res.status(500).send(`Error deleting tute: ${error.message}`);
  }
};

export const getAllTutes = async (req, res) => {
  try {
    // Query to get tutes along with lecturer information
    const query = `
      SELECT 
        tutes.tute_id,
        tutes.title,
        tutes.subtitle,
        tutes.cover_photo,
        tutes.description,
        tutes.status,
        tutes.lid,
        lecturers.name AS lecturer_name
      FROM 
        tutes
      JOIN 
        lecturers ON tutes.lid = lecturers.lid
    `;

    // Execute the query
    const [rows] = await pool.query(query);

    // Return the rows as a response
    res.json(rows);
  } catch (error) {
    console.error("Error fetching tutes with lecturers:", error);
    res.status(500).json({ error: "Failed to fetch tutes with lecturers" });
  }
};


export const getTutesByTeacherId = async (req, res) => {
  const { lid } = req.params;
  
  try {
    // Query to get tutes by teacher ID
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
      WHERE
        lid = ?
    `;

    const [rows] = await pool.query(query, [lid]);

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving tutes:', error);
    res.status(500).send(`Error retrieving tutes: ${error.message}`);
  }
};

