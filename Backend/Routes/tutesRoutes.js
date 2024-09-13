import express from "express";
import multer from "multer";
import {
  createTute,
  getAllTutes,
  updateTute,
  deleteTute,
  getTutesByTeacherId,
} from "../controllers/tutesController.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', getAllTutes);
router.post('/', upload.any(), createTute);
router.put('/:tute_id', upload.any(), updateTute);
router.delete('/:id', deleteTute);
router.get('/:lid', getTutesByTeacherId);

export default router;
