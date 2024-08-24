import express from "express";
import multer from "multer";
import { deleteImage } from "../controllers/albumImagesController.js";


const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.delete('/:aid', deleteImage);

export default router;
