// import path from 'path';
// import { fileURLToPath } from 'url';
// import { uploadFileToSFTP } from '../ftpUpload.js';
import pool from "../db.js"; 

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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
  