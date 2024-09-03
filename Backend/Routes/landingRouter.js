import express from 'express';
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecordById,
  deleteRecordById
} from '../controllers/landingControllers.js';
import multer from 'multer';

// Set up multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 10MB
}).fields([{ name: 'image', maxCount: 1 }]);


const router = express.Router();

// Route to create a new record
router.post('/', upload, createRecord);
router.get('/', getAllRecords);
router.get('/:id', getRecordById);
router.put('/:id',   updateRecordById);
router.delete('/:id', deleteRecordById);

export default router;