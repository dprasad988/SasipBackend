import express from "express";
import multer from "multer";
import {
  getAllLecturers,
  addLecturer,
  updateLecturer,
  deleteLecturer,
  getLecturerById
} from "../controllers/lecturersController.js";

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'profilePicture', maxCount: 1 }, 
  { name: 'qualifications[0][icon]', maxCount: 1 }, 
  { name: 'qualifications[1][icon]', maxCount: 1 },
  { name: 'qualifications[2][icon]', maxCount: 1 },
  { name: 'qualifications[3][icon]', maxCount: 1 },

  // Add more qualification fields as needed
]);

const router = express.Router();

router.get('/', getAllLecturers);
router.get('/:lid', getLecturerById);
router.post('/', upload, addLecturer);
router.put('/:lid', upload, updateLecturer);
router.delete('/:lid', deleteLecturer);

export default router;
