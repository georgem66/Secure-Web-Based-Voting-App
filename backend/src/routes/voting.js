import express from 'express';
import { authenticate, checkVotingEligibility } from '../middleware/auth.js';
import { VotingController } from '../controllers/votingController.js';

const router = express.Router();

router.use(authenticate);

router.get('/candidates', VotingController.getCandidates);

router.post('/vote', checkVotingEligibility, VotingController.castVote);

router.get('/verify/:transactionHash', VotingController.verifyVote);

router.get('/status', VotingController.getVotingStatus);

export default router;
