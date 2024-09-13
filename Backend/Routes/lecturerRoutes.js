import express from "express";
import multer from "multer";
import {
  getAllLecturers,
  addLecturer,
  updateLecturer,
  deleteLecturer,
  getLecturerById,
  getLecturersCount
} from "../controllers/lecturersController.js";

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', getAllLecturers);
router.get('/:lid', getLecturerById);
router.post('/', upload.any(), addLecturer);
router.put('/:lid', upload.any(), updateLecturer);
router.delete('/:lid', deleteLecturer);
router.get('/count/new', getLecturersCount);

export default router;
