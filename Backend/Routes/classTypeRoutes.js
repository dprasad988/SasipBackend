// routes/classTypeRoutes.js
import express from 'express';
const router = express.Router();
import classTypeController from '../controllers/classTypeController.js'

// CRUD routes
router.get('/', classTypeController.getAllClassTypes);
router.post('/', classTypeController.createClassType);
router.get('/:id', classTypeController.getClassTypeById);
router.put('/:id', classTypeController.updateClassType);
router.delete('/:id', classTypeController.deleteClassType);

export default router;
