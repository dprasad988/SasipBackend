import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFileToSFTP } from '../ftpUpload.js';
import pool from "../db.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteImage = async (req, res) => {
    const { aid } = req.params;
    const { image } = req.query; 
    console.log(aid,image);
    
  
    if (!aid || !image) {
      return res.status(400).json({ message: 'Album ID and image URL are required.' });
    }
  
    try {
      // Delete the image from the album_images table
      const [result] = await pool.query(
        'DELETE FROM album_images WHERE album_id = ? AND album_image = ?',
        [aid, image]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Image not found or not associated with the specified album.' });
      }
  
      res.status(200).json({ message: 'Image deleted successfully.' });
    } catch (error) {
      console.error('Error deleting image from album:', error);
      res.status(500).json({ message: 'Failed to delete image.', error: error.message });
    }
};
  
export const updateAlbumImages = async (req, res) => {
    const { aid } = req.params;

    if (!aid || !req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Album ID and images are required.' });
    }

    try {
        const newImages = req.files;
        const uploadedImageUrls = [];

        for (const file of newImages) {
            // Upload file to SFTP and get URL or identifier
            const imageUrl = await uploadFileToSFTP(file.buffer, file.originalname);
            
            // Save the uploaded image URL or identifier in the database
            await pool.query(
                'INSERT INTO album_images (album_id, album_image) VALUES (?, ?)',
                [aid, imageUrl]
            );

            uploadedImageUrls.push(imageUrl);
        }

        res.status(200).json({ message: 'Images updated successfully.', images: uploadedImageUrls });
    } catch (error) {
        console.error('Error updating album images:', error);
        res.status(500).json({ message: 'Failed to update images.', error: error.message });
    }
};

  export const getTotalImagesCount = async (req, res) => {
    try {
      // Query to get the count of all images in the album_images table
      const [results] = await pool.query(
        'SELECT COUNT(*) AS count FROM album_images'
      );

      const count = results[0].count;

      res.status(200).json({ count });
    } catch (error) {
      console.error('Error retrieving total images count:', error);
      res.status(500).json({ message: 'Failed to retrieve total images count.', error: error.message });
    }
  };