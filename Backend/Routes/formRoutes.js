// routes/formRoutes.js

import { Router } from 'express';
import { getAllEntries, createEntry, updateEntry, deleteEntry } from '../controllers/formController.js';

const router = Router();

// Get all form entries
router.get('/', getAllEntries);

// Create a new form entry
router.post('/', createEntry);

// Update an existing form entry
router.put('/:id', updateEntry);

// Delete a form entry
router.delete('/:id', deleteEntry);

export default router;
