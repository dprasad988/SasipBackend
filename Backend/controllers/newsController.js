import pool from "../db.js";
import { fileURLToPath } from 'url';
import { uploadFileToSFTP } from '../ftpUpload.js';
import { deleteFileFromSFTP } from '../ftpUpload.js';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllNews = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM news");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNewsCount = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query("SELECT COUNT(*) AS count FROM news");
    const count = rows[0].count;
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    connection.release(); 
  }
};

export const addNews = async (req, res) => {
  const { lid, title, description, whatsapp, newsStatus } = req.body;
  let newsImageUrl = null;

  const currentTimeUtc = new Date();
  const sriLankanOffset = 5.5 * 60 * 60 * 1000;
  const sriLankanTime = new Date(currentTimeUtc.getTime() + sriLankanOffset);
  const formattedTime = sriLankanTime.toISOString().slice(0, 19).replace('T', ' ');

  if (req.files['image'] && req.files['image'][0]) {
    const fileBuffer = req.files['image'][0].buffer;
    const remoteFileName = req.files['image'][0].originalname;
    newsImageUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
  }

  if (!lid || !title || !description || !whatsapp || !newsStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO news (lid, title, description, whatsapp, newsStatus, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [lid, title, description, whatsapp, newsStatus, newsImageUrl, formattedTime]
    );
    res.json({
      lid,
      title,
      description,
      whatsapp,
      newsStatus,
      newsImageUrl,
      created_at: formattedTime,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNews = async (req, res) => {
  const { id } = req.params;
  const { lid, title, description, whatsapp, newsStatus, image } = req.body;
  if (!lid || !title || !description || !whatsapp || !newsStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE news SET lid = ?, title = ?, description = ?, whatsapp = ?, newsStatus = ?, image = ? WHERE nid = ?",
      [lid, title, description, whatsapp, newsStatus, image, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ id, lid, title, description, whatsapp, newsStatus, image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    // Retrieve the image URL before deleting the news
    const [rows] = await pool.query("SELECT image FROM news WHERE nid = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "News not found" });
    }
    const newsImageUrl = rows[0].image;
 
    // Delete the image from SFTP if it exists
    if (newsImageUrl) {
      await deleteFileFromSFTP(newsImageUrl);
    }

    // Delete the news record from the database
    const [result] = await pool.query("DELETE FROM news WHERE nid = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ message: "News and associated image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};