import express from 'express';
// import { validateApiCall } from '../Middleware/auth.js';
import { getCount, updateCount } from '../controllers/visitCountController.js';

const router = express.Router();

// Define routes
router.post('/', updateCount);
router.get('/', getCount);

export default router;
