import express from 'express';
import { login } from '../controllers/adminLoginController.js';
import { checkToken } from '../Middleware/auth.js';
import { forgotPassword } from '../controllers/forgotPasswordController.js';
import { resetPassword } from '../controllers/resetPasswordController.js';

const router = express.Router();

router.post('/login', login);
router.get('/check-token', checkToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;