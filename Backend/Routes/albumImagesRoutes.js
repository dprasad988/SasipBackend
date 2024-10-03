import express from "express";
import multer from "multer";
import { validateApiCall } from '../Middleware/auth.js';
import { deleteImage, getTotalImagesCount, updateAlbumImages } from "../controllers/albumImagesController.js";


const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.delete('/:aid', validateApiCall,deleteImage);
router.put('/:aid',validateApiCall, upload.any(), updateAlbumImages);
router.get('/count', getTotalImagesCount);

export default router;
