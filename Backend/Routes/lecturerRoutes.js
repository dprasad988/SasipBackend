// routes/lecturerRoutes.js
import express from 'express';
import { getAllLecturers, addLecturer, updateLecturer, deleteLecturer } from '../controllers/lecturersController.js';

const router = express.Router();

router.get('/', getAllLecturers);
router.post('/', addLecturer);
router.put('/:lid', updateLecturer);
router.delete('/:lid', deleteLecturer);

export default router;
