// routes/lecturerRoutes.js
import express from 'express';
import { getAllTimetables, getTimetableById, addTimetable, updateTimetable, deleteTimetable, getPrice, updatePrice, deletePrice } from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', getAllTimetables);
router.get('/price', getPrice);
router.put('/price/:tid', updatePrice);
router.delete('/price/:tid', deletePrice);
router.get('/:tid', getTimetableById);
router.post('/', addTimetable);
router.put('/:tid', updateTimetable);
router.delete('/:tid', deleteTimetable);

export default router;
