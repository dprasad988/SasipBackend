import express from 'express';
import { getSnowEffectStatus, updateSnowEffectStatus } from '../../controllers/FeatureControll/snowControllController.js';

const router = express.Router();

router.get('/', getSnowEffectStatus);
router.post('/', updateSnowEffectStatus);


export default router;
