// routes/classTypeRoutes.js
import express from 'express';
const router = express.Router();
import classTypeController from '../controllers/classTypeController.js'
import { validateApiCall } from '../Middleware/auth.js';

// CRUD routes
router.get('/', classTypeController.getAllClassTypes);
router.post('/', validateApiCall,classTypeController.createClassType);
router.get('/:id',validateApiCall, classTypeController.getClassTypeById);
router.put('/:id', validateApiCall,classTypeController.updateClassType);
router.delete('/:id',validateApiCall, classTypeController.deleteClassType);

export default router;
