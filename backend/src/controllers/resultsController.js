import { database } from '../database/connection.js';
import { logger } from '../utils/logger.js';

export class ResultsController {
  // Get current election results
  static async getCurrentResults(req, res, next) {
    try {
      // Get results grouped by candidate
      const results = await database.query(
        `SELECT c.id, c.name, c.party, c.description, c.image_url,
                COUNT(v.id) as vote_count,
                ROUND((COUNT(v.id) * 100.0 / NULLIF(total_votes.count, 0)), 2) as percentage
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.candidate_id
         CROSS JOIN (SELECT COUNT(*) as count FROM votes) total_votes
         WHERE c.is_active = true
         GROUP BY c.id, c.name, c.party, c.description, c.image_url, total_votes.count
         ORDER BY vote_count DESC, c.name`,
        []
      );

      // Get total vote count
      const totalVotesResult = await database.query(
        'SELECT COUNT(*) as total_votes FROM votes',
        []
      );

      const totalVotes = parseInt(totalVotesResult.rows[0].total_votes);

      // Get election info
      const election = await database.query(
        'SELECT id, title, description, start_date, end_date FROM elections WHERE is_active = true',
        []
      );

      const currentElection = election.rows[0] || null;

      res.json({
        success: true,
        data: {
          election: currentElection,
          results: results.rows.map(row => ({
            candidate: {
              id: row.id,
              name: row.name,
              party: row.party,
              description: row.description,
              imageUrl: row.image_url
            },
            voteCount: parseInt(row.vote_count),
            percentage: parseFloat(row.percentage) || 0
          })),
          totalVotes,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get voting statistics
  static async getStatistics(req, res, next) {
    try {
      // Get total registered users
      const totalUsersResult = await database.query(
        'SELECT COUNT(*) as total_users FROM users WHERE is_verified = true AND is_active = true',
        []
      );

      // Get total votes cast
      const totalVotesResult = await database.query(
        'SELECT COUNT(*) as total_votes FROM votes',
        []
      );

      // Get voting turnout by hour (last 24 hours)
      const hourlyVotingResult = await database.query(
        `SELECT DATE_TRUNC('hour', timestamp) as hour,
                COUNT(*) as votes
         FROM votes 
         WHERE timestamp > NOW() - INTERVAL '24 hours'
         GROUP BY DATE_TRUNC('hour', timestamp)
         ORDER BY hour`,
        []
      );

      // Get top candidates
      const topCandidatesResult = await database.query(
        `SELECT c.name, c.party, COUNT(v.id) as vote_count
         FROM candidates c
         LEFT JOIN votes v ON c.id = v.candidate_id
         WHERE c.is_active = true
         GROUP BY c.id, c.name, c.party
         ORDER BY vote_count DESC
         LIMIT 5`,
        []
      );

      const totalUsers = parseInt(totalUsersResult.rows[0].total_users);
      const totalVotes = parseInt(totalVotesResult.rows[0].total_votes);
      const turnoutRate = totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalRegisteredUsers: totalUsers,
            totalVotesCast: totalVotes,
            turnoutRate: parseFloat(turnoutRate),
            remainingVoters: totalUsers - totalVotes
          },
          hourlyVoting: hourlyVotingResult.rows.map(row => ({
            hour: row.hour,
            votes: parseInt(row.votes)
          })),
          topCandidates: topCandidatesResult.rows.map(row => ({
            name: row.name,
            party: row.party,
            voteCount: parseInt(row.vote_count)
          })),
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}