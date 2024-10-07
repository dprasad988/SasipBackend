import path from 'path';
import { fileURLToPath } from 'url';
import { deleteFileFromSFTP, uploadFileToSFTP } from '../ftpUpload.js';
import pool from "../db.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new album
export const createAlbum = async (req, res) => {
    const { name } = req.body;
    let coverPhotoUrl = null;
    const imageUrls = [];
  
    try {
      // Handle cover photo upload
      const coverPhotoFile = req.files.find(file => file.fieldname === 'cover');
      if (coverPhotoFile) {
        coverPhotoUrl = await uploadFileToSFTP(coverPhotoFile.buffer, coverPhotoFile.originalname);
      }
  
      // Handle images upload
      for (const file of req.files) {
        if (file.fieldname === 'images') {
          const imageUrl = await uploadFileToSFTP(file.buffer, file.originalname);
          imageUrls.push(imageUrl);
        }
      }
  
      // Insert into albums table
      const [result] = await pool.query(
        `INSERT INTO albums (name, cover_photo) VALUES (?, ?)`,
        [name || null, coverPhotoUrl || null]
      );
  
      const albumId = result.insertId;
  
      // Insert each image into album_images table
      for (const imageUrl of imageUrls) {
        await pool.query(
          `INSERT INTO album_images (album_id, album_image) VALUES (?, ?)`,
          [albumId, imageUrl]
        );
      }
  
      res.status(201).json({ albumId });
    } catch (error) {
      console.error('Error creating album:', error);
      res.status(500).send(`Error creating album: ${error.message}`);
    }
  };
  
// Update an album
export const updateAlbum = async (req, res) => {
    const { aid } = req.params;
    const { name = '' } = req.body;
  
    console.log('Updating Album:', req.body);
    console.log('Files:', req.files);
  
    try {
      let coverPhotoUrl = null;
      let imageUrls = [];
  
      const coverPhotoFile = req.files.find(file => file.fieldname === 'cover');
      if (coverPhotoFile) {
        coverPhotoUrl = await uploadFileToSFTP(coverPhotoFile.buffer, coverPhotoFile.originalname);
      }
  
      for (const file of req.files) {
        if (file.fieldname === 'images') {
          const imageUrl = await uploadFileToSFTP(file.buffer, file.originalname);
          imageUrls.push(imageUrl);
        }
      }
  
      const updateQuery = `
        UPDATE albums SET 
          name = COALESCE(?, name), 
          cover_photo = COALESCE(?, cover_photo)
        WHERE aid = ?`;
  
      const updateValues = [
        name,
        coverPhotoUrl,
        aid
      ];
  
      await pool.query(updateQuery, updateValues);
  
      for (const imageUrl of imageUrls) {
        await pool.query(
          `INSERT INTO album_images (album_id, album_image) VALUES (?, ?)`,
          [aid, imageUrl]
        );
      }
  
      res.status(200).json({ message: 'Album updated successfully' });
    } catch (error) {
      console.error('Error updating album:', error);
      res.status(500).send(`Error updating album: ${error.message}`);
    }
  };
    
  export const deleteAlbum = async (req, res) => {
    const { aid } = req.params;
  
    try {
      // Fetch all images associated with the album
      const [images] = await pool.query("SELECT album_image FROM album_images WHERE album_id = ?", [aid]);
  
      // Try to delete each image from SFTP, but skip if the file doesn't exist
      // for (const image of images) {
      //   try {
      //     await deleteFileFromSFTP(image.album_image);
      //   } catch (error) {
      //     if (error.message.includes('No such file')) {
      //       console.warn(`File not found on SFTP: ${image.album_image}, skipping...`);
      //     } else {
      //       console.error(`Error deleting image from SFTP: ${image.album_image}`, error);
      //       return res.status(500).send(`Error deleting image: ${image.album_image}`);
      //     }
      //   }
      // }
  
      // Delete associated images from the database
      await pool.query("DELETE FROM album_images WHERE album_id = ?", [aid]);
  
      // Delete the album itself from the database
      await pool.query("DELETE FROM albums WHERE aid = ?", [aid]);
  
      // Send success response
      res.status(200).send("Album and associated images deleted successfully");
    } catch (error) {
      console.error('Error deleting album:', error);
      res.status(500).send(`Error deleting album: ${error.message}`);
    }
  };
  


// Get all albums
export const getAllAlbums = async (req, res) => {
    try {
      // Query to get albums along with their images
      const query = `
        SELECT 
          albums.aid,
          albums.name,
          albums.cover_photo,
          IFNULL(JSON_ARRAYAGG(album_images.album_image), JSON_ARRAY()) AS images
        FROM 
          albums
        LEFT JOIN 
          album_images ON albums.aid = album_images.album_id
        GROUP BY 
          albums.aid, albums.name, albums.cover_photo
      `;
      
      const [rows] = await pool.query(query);
      
      // Ensure 'images' is an array in the response
      const formattedRows = rows.map(row => ({
        ...row,
        images: JSON.parse(row.images) // Convert JSON string to array
      }));
  
      res.json(formattedRows);
    } catch (error) {
      console.error('Error retrieving albums:', error);
      res.status(500).send(`Error retrieving albums: ${error.message}`);
    }
  };
  
