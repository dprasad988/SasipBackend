// routes/lecturerRoutes.js
import express from 'express';
import { getAllTimetables, getTimetableById, addTimetable, updateTimetable, deleteTimetable, getPrice, updatePrice, deletePrice, addPrice, deleteEditPrice, getTimetablesCount } from '../controllers/timetableController.js';
import { validateApiCall } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', getAllTimetables);
router.get('/price', getPrice);
router.put('/price/:tid', updatePrice);
router.delete('/price/:tid', deletePrice);
router.delete('/price/edit/:id', deleteEditPrice);
router.put('/price/:tid',validateApiCall, updatePrice);
router.delete('/price/:tid',validateApiCall, deletePrice);
router.get('/:tid', getTimetableById);
router.post('/',validateApiCall, addTimetable);
router.put('/:tid',validateApiCall, updateTimetable);
router.delete('/:tid',validateApiCall, deleteTimetable);
router.post('/', addTimetable);
router.put('/:tid', updateTimetable);
router.delete('/:tid', deleteTimetable);
router.post('/price', addPrice);
router.get('/count/newCount', getTimetablesCount);

export default router;
