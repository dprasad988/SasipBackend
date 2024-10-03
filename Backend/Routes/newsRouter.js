import express from "express";
import multer from "multer";
import {
  getAllNews,
  addNews,
  updateNews,
  deleteNews,
  getNewsCount,
} from "../controllers/newsController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: "image", maxCount: 1 }]);
import { validateApiCall } from '../Middleware/auth.js';


router.get("/", getAllNews);

router.get('/count', getNewsCount);
router.post("/",validateApiCall,upload, addNews);
router.put("/:id", validateApiCall,updateNews);
router.delete("/:id",validateApiCall, deleteNews);

export default router;
