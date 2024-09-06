import express from 'express';
import { getFlagDisplayStatus, updateFlagDisplayStatus } from '../../controllers/FeatureControll/flagControllController.js';

const router = express.Router();

router.get('/', getFlagDisplayStatus);
router.post('/', updateFlagDisplayStatus);

export default router;
