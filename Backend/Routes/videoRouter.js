import express from 'express';
import multer from "multer";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo} from '../controllers/videoController.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
import { validateApiCall } from '../Middleware/auth.js';

const router = express.Router();

// Define routes
router.post('/', upload.single('pdfFile'), createVideo);
router.post('/',validateApiCall, createVideo);
router.get('/', getVideos);
router.get('/:lid', getVideoById);
router.put('/:id', upload.single('pdfFile'), updateVideo);
router.put('/:id', validateApiCall,updateVideo);
router.delete('/:id',validateApiCall, deleteVideo);

export default router;
