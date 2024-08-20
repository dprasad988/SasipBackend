// routes/lecturerRoutes.js
import express from 'express';
import { getAllTimetables, getTimetableById, addTimetable, updateTimetable, deleteTimetable } from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', getAllTimetables);
router.get('/:tid', getTimetableById);
router.post('/', addTimetable);
router.put('/:tid', updateTimetable);
router.delete('/:tid', deleteTimetable);

export default router;
