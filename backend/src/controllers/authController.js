import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database/connection.js';
import { config } from '../config/config.js';
import { encryptionService } from '../utils/encryption.js';
import { logger, securityLogger } from '../utils/logger.js';
import { sendVerificationEmail, sendOTPEmail } from '../services/emailService.js';

export class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await database.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password with bcrypt
      const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
      
      // Generate verification token
      const verificationToken = encryptionService.generateSecureToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const result = await database.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, verification_token, verification_expires)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name`,
        [email.toLowerCase(), passwordHash, firstName, lastName, verificationToken, verificationExpires]
      );

      const user = result.rows[0];

      // Send verification email
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Continue with registration even if email fails
      }

      // Log security event
      securityLogger.info('User registration', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify email
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      const user = await database.query(
        `UPDATE users 
         SET is_verified = true, verification_token = null, verification_expires = null
         WHERE verification_token = $1 AND verification_expires > NOW()
         RETURNING id, email, first_name, last_name`,
        [token]
      );

      if (user.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      const userData = user.rows[0];

      securityLogger.info('Email verification completed', {
        userId: userData.id,
        email: userData.email,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  static async login(req, res, next) {
    try {
      const { email, password, totpCode } = req.body;

      // Get user with password
      const userResult = await database.query(
        `SELECT id, email, password_hash, first_name, last_name, role, is_verified, 
                is_active, mfa_enabled, mfa_secret, failed_login_attempts, locked_until
         FROM users WHERE email = $1`,
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        securityLogger.warn('Login attempt with non-existent email', {
          email,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        });
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = userResult.rows[0];

      // Check if account is locked
      if (user.locked_until && new Date() < user.locked_until) {
        securityLogger.warn('Login attempt on locked account', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        });
        
        return res.status(423).json({
          success: false,
          message: 'Account temporarily locked due to multiple failed login attempts'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        // Increment failed login attempts
        const attempts = user.failed_login_attempts + 1;
        const locked_until = attempts >= config.MAX_LOGIN_ATTEMPTS 
          ? new Date(Date.now() + config.LOCKOUT_TIME) 
          : null;

        await database.query(
          'UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
          [attempts, locked_until, user.id]
        );

        securityLogger.warn('Failed login attempt', {
          userId: user.id,
          email: user.email,
          attempts,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is verified
      if (!user.is_verified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Check MFA if enabled
      if (user.mfa_enabled) {
        if (!totpCode) {
          return res.status(200).json({
            success: true,
            requiresMFA: true,
            message: 'TOTP code required'
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.mfa_secret,
          encoding: 'base32',
          token: totpCode,
          window: config.OTP_WINDOW
        });

        if (!verified) {
          securityLogger.warn('Invalid MFA code', {
            userId: user.id,
            ip: req.ip,
            timestamp: new Date().toISOString(),
          });
          
          return res.status(401).json({
            success: false,
            message: 'Invalid TOTP code'
          });
        }
      }

      // Reset failed login attempts
      await database.query(
        'UPDATE users SET failed_login_attempts = 0, locked_until = null, last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        config.JWT_SECRET,
        { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
      );

      // Store session
      const sessionToken = encryptionService.generateSecureToken();
      const csrfToken = encryptionService.generateSecureToken();
      
      await database.query(
        `INSERT INTO user_sessions (user_id, session_token, csrf_token, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          sessionToken,
          csrfToken,
          req.ip,
          req.get('User-Agent'),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        ]
      );

      securityLogger.info('Successful login', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
          },
          accessToken,
          refreshToken,
          csrfToken,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Setup MFA
  static async setupMFA(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Secure Voting (${req.user.email})`,
        issuer: 'Secure Voting App'
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Store secret temporarily (will be confirmed when user verifies)
      await database.query(
        'UPDATE users SET mfa_secret = $1 WHERE id = $2',
        [secret.base32, userId]
      );

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
          manualEntryKey: secret.base32
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify and enable MFA
  static async verifyMFA(req, res, next) {
    try {
      const { totpCode } = req.body;
      const userId = req.user.id;

      const user = await database.query(
        'SELECT mfa_secret FROM users WHERE id = $1',
        [userId]
      );

      if (user.rows.length === 0 || !user.rows[0].mfa_secret) {
        return res.status(400).json({
          success: false,
          message: 'MFA setup not initiated'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.rows[0].mfa_secret,
        encoding: 'base32',
        token: totpCode,
        window: config.OTP_WINDOW
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid TOTP code'
        });
      }

      // Enable MFA
      await database.query(
        'UPDATE users SET mfa_enabled = true WHERE id = $1',
        [userId]
      );

      securityLogger.info('MFA enabled', {
        userId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'MFA enabled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Disable MFA
  static async disableMFA(req, res, next) {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      // Verify password
      const user = await database.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Disable MFA
      await database.query(
        'UPDATE users SET mfa_enabled = false, mfa_secret = null WHERE id = $1',
        [userId]
      );

      securityLogger.info('MFA disabled', {
        userId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'MFA disabled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  static async logout(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Invalidate all sessions for this user
      await database.query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [userId]
      );

      securityLogger.info('User logout', {
        userId,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Get user
      const user = await database.query(
        'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (user.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = user.rows[0];

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: userData.id, email: userData.email, role: userData.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const user = await database.query(
        `SELECT id, email, first_name, last_name, role, is_verified, mfa_enabled, 
                last_login, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = user.rows[0];

      // Check if user has voted
      const voteResult = await database.query(
        'SELECT id FROM votes WHERE user_id = $1',
        [req.user.id]
      );

      res.json({
        success: true,
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            role: userData.role,
            isVerified: userData.is_verified,
            mfaEnabled: userData.mfa_enabled,
            hasVoted: voteResult.rows.length > 0,
            lastLogin: userData.last_login,
            createdAt: userData.created_at,
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}