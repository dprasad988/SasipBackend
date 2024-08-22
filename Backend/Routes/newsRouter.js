import express from "express";
import {
  getAllNews,
  addNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: "image", maxCount: 1 }]);

router.get("/", getAllNews);
router.post("/", addNews);
router.put("/:id", updateNews);
router.delete("/:id", deleteNews);

export default router;
