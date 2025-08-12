import { database } from '../database/connection.js';
import { encryptionService } from '../utils/encryption.js';
import { logger, securityLogger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class VotingController {

  static async getCandidates(req, res, next) {
    try {
      const candidates = await database.query(
        `SELECT id, name, party, description, image_url 
         FROM candidates 
         WHERE is_active = true 
         ORDER BY name`,
        []
      );

      res.json({
        success: true,
        data: {
          candidates: candidates.rows
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async castVote(req, res, next) {
    try {
      const { candidateId } = req.body;
      const userId = req.user.id;

      const result = await database.transaction(async (client) => {

        const candidate = await client.query(
          'SELECT id, name FROM candidates WHERE id = $1 AND is_active = true',
          [candidateId]
        );

        if (candidate.rows.length === 0) {
          throw new Error('Invalid candidate selected');
        }

        const election = await client.query(
          'SELECT id FROM elections WHERE is_active = true AND start_date <= NOW() AND end_date > NOW()',
          []
        );

        if (election.rows.length === 0) {
          throw new Error('No active election');
        }

        const electionId = election.rows[0].id;

        const lastVote = await client.query(
          'SELECT transaction_hash, block_index FROM votes ORDER BY block_index DESC LIMIT 1',
          []
        );

        const previousHash = lastVote.rows.length > 0 
          ? lastVote.rows[0].transaction_hash 
          : '0000000000000000000000000000000000000000000000000000000000000000';
        
        const blockIndex = lastVote.rows.length > 0 
          ? lastVote.rows[0].block_index + 1 
          : 1;

        const timestamp = new Date();
        const nonce = encryptionService.generateSecureToken(16);
        
        const voteData = {
          userId,
          candidateId,
          electionId,
          timestamp: timestamp.toISOString(),
          nonce
        };

        const encryptedVote = encryptionService.encryptVote(voteData);

        const transactionHash = encryptionService.generateHash(
          {
            userId: encryptionService.hashData(userId), // Hash user ID for privacy
            candidateId,
            timestamp: timestamp.toISOString(),
            nonce
          },
          previousHash
        );

        const voteResult = await client.query(
          `INSERT INTO votes (user_id, candidate_id, election_id, encrypted_vote, 
                             transaction_hash, previous_hash, block_index, nonce, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, transaction_hash`,
          [
            userId,
            candidateId, 
            electionId,
            JSON.stringify(encryptedVote),
            transactionHash,
            previousHash,
            blockIndex,
            nonce,
            timestamp
          ]
        );

        await client.query(
          `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, details)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            'VOTE_CAST',
            'vote',
            voteResult.rows[0].id,
            req.ip,
            req.get('User-Agent'),
            JSON.stringify({
              candidateId,
              transactionHash,
              blockIndex,
              timestamp: timestamp.toISOString()
            })
          ]
        );

        return {
          voteId: voteResult.rows[0].id,
          transactionHash: voteResult.rows[0].transaction_hash,
          blockIndex,
          candidateName: candidate.rows[0].name,
          timestamp
        };
      });

      securityLogger.info('Vote cast successfully', {
        userId,
        candidateId,
        transactionHash: result.transactionHash,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: {
          transactionHash: result.transactionHash,
          candidateName: result.candidateName,
          blockIndex: result.blockIndex,
          timestamp: result.timestamp,
          receipt: {
            id: result.voteId,
            hash: result.transactionHash,
            timestamp: result.timestamp
          }
        }
      });
    } catch (error) {
      securityLogger.warn('Vote casting failed', {
        userId: req.user.id,
        error: error.message,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      
      if (error.message === 'Invalid candidate selected' || error.message === 'No active election') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      next(error);
    }
  }

  static async verifyVote(req, res, next) {
    try {
      const { transactionHash } = req.params;
      const userId = req.user.id;

      const vote = await database.query(
        `SELECT v.id, v.transaction_hash, v.previous_hash, v.block_index, v.timestamp,
                c.name as candidate_name, c.party,
                CASE WHEN v.user_id = $1 THEN true ELSE false END as is_own_vote
         FROM votes v
         JOIN candidates c ON v.candidate_id = c.id
         WHERE v.transaction_hash = $2`,
        [userId, transactionHash]
      );

      if (vote.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Vote transaction not found'
        });
      }

      const voteData = vote.rows[0];

      const isValid = await this.verifyBlockchainIntegrity(transactionHash);

      res.json({
        success: true,
        data: {
          transactionHash: voteData.transaction_hash,
          blockIndex: voteData.block_index,
          timestamp: voteData.timestamp,
          isValid,
          isOwnVote: voteData.is_own_vote,
          ...(voteData.is_own_vote && {
            candidateName: voteData.candidate_name,
            candidateParty: voteData.party
          })
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVotingStatus(req, res, next) {
    try {
      const userId = req.user.id;

      const vote = await database.query(
        `SELECT v.id, v.transaction_hash, v.timestamp, c.name as candidate_name
         FROM votes v
         JOIN candidates c ON v.candidate_id = c.id
         WHERE v.user_id = $1`,
        [userId]
      );

      const election = await database.query(
        'SELECT id, title, description, start_date, end_date FROM elections WHERE is_active = true',
        []
      );

      const hasVoted = vote.rows.length > 0;
      const currentElection = election.rows[0] || null;
      const canVote = currentElection && 
                      new Date() >= new Date(currentElection.start_date) &&
                      new Date() < new Date(currentElection.end_date) &&
                      !hasVoted;

      res.json({
        success: true,
        data: {
          hasVoted,
          canVote,
          currentElection,
          ...(hasVoted && {
            voteDetails: {
              transactionHash: vote.rows[0].transaction_hash,
              candidateName: vote.rows[0].candidate_name,
              timestamp: vote.rows[0].timestamp
            }
          })
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyBlockchainIntegrity(transactionHash) {
    try {

      const voteResult = await database.query(
        'SELECT transaction_hash, previous_hash, block_index FROM votes WHERE transaction_hash = $1',
        [transactionHash]
      );

      if (voteResult.rows.length === 0) {
        return false;
      }

      const vote = voteResult.rows[0];

      if (vote.block_index === 1) {
        return vote.previous_hash === '0000000000000000000000000000000000000000000000000000000000000000';
      }

      const previousVote = await database.query(
        'SELECT transaction_hash FROM votes WHERE block_index = $1',
        [vote.block_index - 1]
      );

      if (previousVote.rows.length === 0) {
        return false;
      }

      return vote.previous_hash === previousVote.rows[0].transaction_hash;
    } catch (error) {
      logger.error('Error verifying blockchain integrity:', error);
      return false;
    }
  }
}
