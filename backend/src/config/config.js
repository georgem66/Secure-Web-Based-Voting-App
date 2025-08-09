import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://voting_user:secure_password_2024!@localhost:5432/secure_voting',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  
  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your_32_byte_encryption_key_here!!',
  RSA_KEY_SIZE: 2048,
  
  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://localhost:3000',
  
  // Email configuration (for OTP)
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@securevoting.com',
  
  // OTP configuration
  OTP_WINDOW: 30, // seconds
  OTP_DIGITS: 6,
  
  // Security
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  
  // Vote encryption
  VOTE_ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  
  // Blockchain-style ledger
  GENESIS_HASH: '0000000000000000000000000000000000000000000000000000000000000000',
  
  // Admin settings
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@securevoting.com',
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX_REQUESTS: 5,
};