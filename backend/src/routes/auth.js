import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  validate
], AuthController.register);

router.get('/verify/:token', [
  param('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid verification token'),
  validate
], AuthController.verifyEmail);

router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('totpCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('TOTP code must be 6 digits'),
  validate
], AuthController.login);

router.post('/logout', authenticate, AuthController.logout);

router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  validate
], AuthController.refreshToken);

router.get('/profile', authenticate, AuthController.getProfile);

router.post('/mfa/setup', authenticate, AuthController.setupMFA);

router.post('/mfa/verify', [
  authenticate,
  body('totpCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('TOTP code must be 6 digits'),
  validate
], AuthController.verifyMFA);

router.post('/mfa/disable', [
  authenticate,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
], AuthController.disableMFA);

export default router;
