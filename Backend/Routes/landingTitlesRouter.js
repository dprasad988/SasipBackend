import express from 'express';
import { getAllTitles, updateTitle } from '../controllers/landingTitlesController.js';

const router = express.Router();

router.get('/', getAllTitles);
router.put('/:id', updateTitle);

export default router;
