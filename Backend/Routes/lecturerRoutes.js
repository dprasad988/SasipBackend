import express from "express";
import multer from "multer";
import {
  getAllLecturers,
  addLecturer,
  updateLecturer,
  deleteLecturer,
  getLecturerById
} from "../controllers/lecturersController.js";
import { validateApiCall } from '../Middleware/auth.js';

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', getAllLecturers);
router.get('/:lid', getLecturerById);
router.post('/',validateApiCall, upload.any(), addLecturer);
router.put('/:lid',validateApiCall, upload.any(), updateLecturer);
router.delete('/:lid',validateApiCall, deleteLecturer);

export default router;
