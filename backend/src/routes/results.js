import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { ResultsController } from '../controllers/resultsController.js';

const router = express.Router();

router.use(authenticate);

router.get('/current', ResultsController.getCurrentResults);

router.get('/statistics', ResultsController.getStatistics);

export default router;
