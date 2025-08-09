import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { ResultsController } from '../controllers/resultsController.js';

const router = express.Router();

// All results routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /results/current:
 *   get:
 *     summary: Get current election results
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results retrieved successfully
 */
router.get('/current', ResultsController.getCurrentResults);

/**
 * @swagger
 * /results/statistics:
 *   get:
 *     summary: Get voting statistics
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', ResultsController.getStatistics);

export default router;