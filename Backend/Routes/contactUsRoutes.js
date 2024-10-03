import express from 'express';
import { contactController } from '../controllers/contactUsController.js';
import { validateApiCall } from '../Middleware/auth.js';

const router = express.Router();

router.post('/', contactController);

export default router;