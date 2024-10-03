// routes/formRoutes.js
import { validateApiCall } from '../Middleware/auth.js';
import { Router } from 'express';
import { getAllEntries, createEntry, updateEntry, deleteEntry } from '../controllers/formController.js';

const router = Router();

// Get all form entries
router.get('/', getAllEntries);

// Create a new form entry
router.post('/', validateApiCall , createEntry);

// Update an existing form entry
router.put('/:id', validateApiCall,updateEntry);

// Delete a form entry
router.delete('/:id',validateApiCall, deleteEntry);

export default router;
