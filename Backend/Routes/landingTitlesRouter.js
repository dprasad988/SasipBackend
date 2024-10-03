import express from 'express';
import { getAllTitles, updateTitle } from '../controllers/landingTitlesController.js';
import { validateApiCall } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', getAllTitles);
router.put('/:id',validateApiCall, updateTitle);

export default router;
