import express from "express";
import multer from "multer";
import {
  createAlbum,
  getAllAlbums,
  updateAlbum,
  deleteAlbum,
} from "../controllers/albumsController.js";
import { validateApiCall } from '../Middleware/auth.js';

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', getAllAlbums);
router.post('/',validateApiCall, upload.any(), createAlbum);
router.put('/:aid',validateApiCall, upload.any(), updateAlbum);
router.delete('/:aid',validateApiCall, deleteAlbum);

export default router;
