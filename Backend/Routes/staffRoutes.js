import express from "express";
import multer from "multer";
import {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/staffController.js";

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

const router = express.Router();

// Define routes
router.get("/", getAllMembers);
router.post("/", upload.fields([{ name: 'image', maxCount: 1 }]), createMember);
router.put("/:sid", upload.fields([{ name: 'image', maxCount: 1 }]), updateMember);
router.delete("/:sid", deleteMember);

export default router;
