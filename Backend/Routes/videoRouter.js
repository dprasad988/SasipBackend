// videoRouter.js
import express from 'express';
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo} from '../controllers/videoController.js';
import { validateApiCall } from '../Middleware/auth.js';

const router = express.Router();

// Define routes
router.post('/',validateApiCall, createVideo);
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.put('/:id', validateApiCall,updateVideo);
router.delete('/:id',validateApiCall, deleteVideo);

export default router;
