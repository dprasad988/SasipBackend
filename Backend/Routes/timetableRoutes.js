// routes/lecturerRoutes.js
import express from 'express';
import { getAllTimetables, addTimetable, updateTimetable, deleteTimetable, getPrice } from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', getAllTimetables);
router.get('/price', getPrice);
router.post('/', addTimetable);
router.put('/:tid', updateTimetable);
router.delete('/:tid', deleteTimetable);

export default router;
