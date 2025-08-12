import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { AdminController } from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/candidates', AdminController.getAllCandidates);

router.post('/candidates', AdminController.createCandidate);

router.get('/users', AdminController.getAllUsers);

router.get('/audit-logs', AdminController.getAuditLogs);

router.get('/results/detailed', AdminController.getDetailedResults);

export default router;
