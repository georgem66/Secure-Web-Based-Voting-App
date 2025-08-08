import express from 'express';
import { authenticate, checkVotingEligibility } from '../middleware/auth.js';
import { VotingController } from '../controllers/votingController.js';

const router = express.Router();

// All voting routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /voting/candidates:
 *   get:
 *     summary: Get list of candidates
 *     tags: [Voting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully
 */
router.get('/candidates', VotingController.getCandidates);

/**
 * @swagger
 * /voting/vote:
 *   post:
 *     summary: Cast a vote
 *     tags: [Voting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vote'
 *     responses:
 *       201:
 *         description: Vote cast successfully
 *       403:
 *         description: User has already voted
 */
router.post('/vote', checkVotingEligibility, VotingController.castVote);

/**
 * @swagger
 * /voting/verify/{transactionHash}:
 *   get:
 *     summary: Verify a vote transaction
 *     tags: [Voting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionHash
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote verification successful
 */
router.get('/verify/:transactionHash', VotingController.verifyVote);

/**
 * @swagger
 * /voting/status:
 *   get:
 *     summary: Get user voting status
 *     tags: [Voting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Voting status retrieved successfully
 */
router.get('/status', VotingController.getVotingStatus);

export default router;