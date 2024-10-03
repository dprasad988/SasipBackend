import express from "express";
import multer from "multer";
import {
  createTute,
  getAllTutes,
  updateTute,
  deleteTute,
} from "../controllers/tutesController.js";
import { validateApiCall } from '../Middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', getAllTutes);
router.post('/',validateApiCall, upload.any(), createTute);
router.put('/:id',validateApiCall, upload.any(), updateTute);
router.delete('/:id',validateApiCall, deleteTute);

export default router;
