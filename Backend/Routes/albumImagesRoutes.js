import express from "express";
import multer from "multer";
import { deleteImage, updateAlbumImages } from "../controllers/albumImagesController.js";
import { validateApiCall } from '../Middleware/auth.js';


const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.delete('/:aid', validateApiCall,deleteImage);
router.put('/:aid',validateApiCall, upload.any(), updateAlbumImages);

export default router;
