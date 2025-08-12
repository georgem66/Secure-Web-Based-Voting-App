import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { database } from '../database/connection.js';
import { securityLogger } from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token required' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await database.query(
      'SELECT id, email, first_name, last_name, role, is_verified, is_active, last_login FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      securityLogger.warn('Authentication failed - user not found', {
        userId: decoded.userId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    const userData = user.rows[0];

    if (!userData.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account deactivated' 
      });
    }

    if (!userData.is_verified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account not verified' 
      });
    }

    req.user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      isVerified: userData.is_verified,
      lastLogin: userData.last_login,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      securityLogger.warn('Invalid JWT token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    next(error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      securityLogger.warn('Authorization failed', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

export const checkVotingEligibility = async (req, res, next) => {
  try {
    const vote = await database.query(
      'SELECT id FROM votes WHERE user_id = $1',
      [req.user.id]
    );

    if (vote.rows.length > 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'User has already voted' 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
