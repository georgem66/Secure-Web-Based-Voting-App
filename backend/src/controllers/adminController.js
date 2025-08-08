import { database } from '../database/connection.js';
import { logger, securityLogger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class AdminController {
  // Get all candidates
  static async getAllCandidates(req, res, next) {
    try {
      const candidates = await database.query(
        `SELECT c.*, 
                COUNT(v.id) as vote_count,
                c.created_at,
                c.updated_at
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.candidate_id
         GROUP BY c.id
         ORDER BY c.name`,
        []
      );

      res.json({
        success: true,
        data: {
          candidates: candidates.rows.map(row => ({
            id: row.id,
            name: row.name,
            party: row.party,
            description: row.description,
            imageUrl: row.image_url,
            isActive: row.is_active,
            voteCount: parseInt(row.vote_count),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new candidate
  static async createCandidate(req, res, next) {
    try {
      const { name, party, description, imageUrl } = req.body;

      const result = await database.query(
        `INSERT INTO candidates (name, party, description, image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, party, description, image_url, is_active, created_at`,
        [name, party || null, description || null, imageUrl || null]
      );

      const candidate = result.rows[0];

      // Log admin action
      await database.query(
        `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          req.user.id,
          'CANDIDATE_CREATE',
          'candidate',
          candidate.id,
          req.ip,
          req.get('User-Agent'),
          JSON.stringify({
            candidateName: candidate.name,
            party: candidate.party
          })
        ]
      );

      securityLogger.info('Candidate created by admin', {
        adminUserId: req.user.id,
        candidateId: candidate.id,
        candidateName: candidate.name,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Candidate created successfully',
        data: {
          candidate: {
            id: candidate.id,
            name: candidate.name,
            party: candidate.party,
            description: candidate.description,
            imageUrl: candidate.image_url,
            isActive: candidate.is_active,
            createdAt: candidate.created_at
          }
        }
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'Candidate with this name already exists'
        });
      }
      next(error);
    }
  }

  // Get all users
  static async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 50, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let params = [];

      if (search) {
        whereClause = `WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
        params.push(`%${search}%`);
      }

      // Get users with pagination
      const users = await database.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_verified, u.is_active,
                u.mfa_enabled, u.last_login, u.created_at,
                CASE WHEN v.user_id IS NOT NULL THEN true ELSE false END as has_voted
         FROM users u
         LEFT JOIN votes v ON u.id = v.user_id
         ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await database.query(
        `SELECT COUNT(*) as total FROM users u ${whereClause}`,
        params
      );

      const total = parseInt(totalResult.rows[0].total);

      res.json({
        success: true,
        data: {
          users: users.rows.map(row => ({
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            isVerified: row.is_verified,
            isActive: row.is_active,
            mfaEnabled: row.mfa_enabled,
            hasVoted: row.has_voted,
            lastLogin: row.last_login,
            createdAt: row.created_at
          })),
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get audit logs
  static async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 100, action = '', userId = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let params = [];

      if (action) {
        whereConditions.push(`action ILIKE $${params.length + 1}`);
        params.push(`%${action}%`);
      }

      if (userId) {
        whereConditions.push(`user_id = $${params.length + 1}`);
        params.push(userId);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const logs = await database.query(
        `SELECT a.*, u.email, u.first_name, u.last_name
         FROM audit_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ${whereClause}
         ORDER BY a.timestamp DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await database.query(
        `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`,
        params
      );

      const total = parseInt(totalResult.rows[0].total);

      res.json({
        success: true,
        data: {
          logs: logs.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            userEmail: row.email,
            userName: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : null,
            action: row.action,
            resource: row.resource,
            resourceId: row.resource_id,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            details: row.details,
            timestamp: row.timestamp
          })),
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get detailed voting results for admin
  static async getDetailedResults(req, res, next) {
    try {
      // Get detailed results with vote timestamps and blockchain info
      const results = await database.query(
        `SELECT c.id, c.name, c.party, c.description,
                COUNT(v.id) as vote_count,
                MIN(v.timestamp) as first_vote_time,
                MAX(v.timestamp) as last_vote_time,
                ROUND((COUNT(v.id) * 100.0 / NULLIF(total_votes.count, 0)), 2) as percentage
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.candidate_id
         CROSS JOIN (SELECT COUNT(*) as count FROM votes) total_votes
         WHERE c.is_active = true
         GROUP BY c.id, c.name, c.party, c.description, total_votes.count
         ORDER BY vote_count DESC, c.name`,
        []
      );

      // Get voting timeline (votes per hour)
      const timeline = await database.query(
        `SELECT DATE_TRUNC('hour', timestamp) as hour,
                COUNT(*) as votes
         FROM votes 
         GROUP BY DATE_TRUNC('hour', timestamp)
         ORDER BY hour`,
        []
      );

      // Get blockchain integrity status
      const blockchainStatus = await database.query(
        `SELECT COUNT(*) as total_blocks,
                MIN(block_index) as first_block,
                MAX(block_index) as last_block,
                COUNT(DISTINCT previous_hash) as unique_previous_hashes
         FROM votes`,
        []
      );

      // Get system stats
      const systemStats = await database.query(
        `SELECT 
           (SELECT COUNT(*) FROM users WHERE is_verified = true AND is_active = true) as total_verified_users,
           (SELECT COUNT(*) FROM votes) as total_votes,
           (SELECT COUNT(*) FROM candidates WHERE is_active = true) as total_active_candidates,
           (SELECT COUNT(*) FROM user_sessions WHERE expires_at > NOW()) as active_sessions`,
        []
      );

      const stats = systemStats.rows[0];

      res.json({
        success: true,
        data: {
          results: results.rows.map(row => ({
            candidate: {
              id: row.id,
              name: row.name,
              party: row.party,
              description: row.description
            },
            voteCount: parseInt(row.vote_count),
            percentage: parseFloat(row.percentage) || 0,
            firstVoteTime: row.first_vote_time,
            lastVoteTime: row.last_vote_time
          })),
          votingTimeline: timeline.rows.map(row => ({
            hour: row.hour,
            votes: parseInt(row.votes)
          })),
          blockchainStatus: {
            totalBlocks: parseInt(blockchainStatus.rows[0].total_blocks),
            firstBlock: parseInt(blockchainStatus.rows[0].first_block || 0),
            lastBlock: parseInt(blockchainStatus.rows[0].last_block || 0),
            uniquePreviousHashes: parseInt(blockchainStatus.rows[0].unique_previous_hashes)
          },
          systemStats: {
            totalVerifiedUsers: parseInt(stats.total_verified_users),
            totalVotes: parseInt(stats.total_votes),
            totalActiveCandidates: parseInt(stats.total_active_candidates),
            activeSessions: parseInt(stats.active_sessions),
            turnoutRate: parseFloat((parseInt(stats.total_votes) / parseInt(stats.total_verified_users) * 100).toFixed(2)) || 0
          },
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}