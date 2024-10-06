import express from 'express';
import { 
    getAllYears, 
    getYearById, 
    createYear, 
    updateYear, 
    deleteYear 
} from '../controllers/yearController.js'; 

const router = express.Router();

// GET all years
router.get('/', getAllYears);

// GET a year by ID
router.get('/:id', getYearById);

// POST a new year
router.post('/', createYear);

// PUT to update a year
router.put('/:id', updateYear);

// DELETE a year
router.delete('/:id', deleteYear);

export default router; // Use export default for ES module
