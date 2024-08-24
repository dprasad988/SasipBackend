// videoRouter.js
import express from 'express';
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo} from '../controllers/videoController.js';

const router = express.Router();

// Define routes
router.post('/', createVideo);
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;
