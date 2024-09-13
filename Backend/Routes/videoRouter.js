import express from 'express';
import multer from "multer";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo} from '../controllers/videoController.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

// Define routes
router.post('/', upload.single('pdfFile'), createVideo);
router.get('/', getVideos);
router.get('/:lid', getVideoById);
router.put('/:id', upload.single('pdfFile'), updateVideo);
router.delete('/:id', deleteVideo);

export default router;
