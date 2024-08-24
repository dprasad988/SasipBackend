import express from "express";
import multer from "multer";
import {
  createAlbum,
  getAllAlbums,
  updateAlbum,
  deleteAlbum,
} from "../controllers/albumsController.js";

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', getAllAlbums);
router.post('/', upload.any(), createAlbum);
router.put('/:aid', upload.any(), updateAlbum);
router.delete('/:aid', deleteAlbum);

export default router;
