import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { AdminController } from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

/**
 * @swagger
 * /admin/candidates:
 *   get:
 *     summary: Get all candidates (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully
 */
router.get('/candidates', AdminController.getAllCandidates);

/**
 * @swagger
 * /admin/candidates:
 *   post:
 *     summary: Create new candidate
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       201:
 *         description: Candidate created successfully
 */
router.post('/candidates', AdminController.createCandidate);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/audit-logs', AdminController.getAuditLogs);

/**
 * @swagger
 * /admin/results/detailed:
 *   get:
 *     summary: Get detailed voting results
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed results retrieved successfully
 */
router.get('/results/detailed', AdminController.getDetailedResults);

export default router;