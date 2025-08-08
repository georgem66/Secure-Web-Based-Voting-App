import nodemailer from 'nodemailer';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

// Create transporter for sending emails
let transporter = null;

try {
  transporter = nodemailer.createTransporter({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });
} catch (error) {
  logger.warn('Email service not configured properly:', error.message);
}

export const sendVerificationEmail = async (email, token) => {
  if (!transporter || !config.EMAIL_USER) {
    logger.warn('Email service not configured - verification email not sent');
    return;
  }

  const verificationUrl = `${config.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Secure Voting - Verify Your Email',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2c3e50; text-align: center;">Secure Voting System</h2>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #34495e;">Verify Your Email Address</h3>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with our Secure Voting System. To complete your registration, 
            please click the button below to verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #3498db; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #3498db;">${verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
        <p style="color: #95a5a6; font-size: 12px; text-align: center;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw error;
  }
};

export const sendOTPEmail = async (email, otp) => {
  if (!transporter || !config.EMAIL_USER) {
    logger.warn('Email service not configured - OTP email not sent');
    return;
  }

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Secure Voting - Your OTP Code',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2c3e50; text-align: center;">Secure Voting System</h2>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #34495e;">Your One-Time Password</h3>
          <p style="color: #666; line-height: 1.6;">
            You requested a one-time password for secure access. Use the code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #2c3e50; color: white; font-size: 32px; 
                        padding: 20px; border-radius: 10px; letter-spacing: 5px; 
                        font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          <p style="color: #e74c3c; font-size: 14px; text-align: center;">
            <strong>This code expires in 5 minutes.</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            For your security, do not share this code with anyone.
          </p>
        </div>
        <p style="color: #95a5a6; font-size: 12px; text-align: center;">
          If you didn't request this code, please contact support immediately.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error('Failed to send OTP email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  if (!transporter || !config.EMAIL_USER) {
    logger.warn('Email service not configured - password reset email not sent');
    return;
  }

  const resetUrl = `${config.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Secure Voting - Password Reset',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2c3e50; text-align: center;">Secure Voting System</h2>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #34495e;">Reset Your Password</h3>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset for your Secure Voting account. 
            Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #e74c3c; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #e74c3c;">${resetUrl}</a>
          </p>
          <p style="color: #e74c3c; font-size: 14px;">
            <strong>This link will expire in 1 hour for security reasons.</strong>
          </p>
        </div>
        <p style="color: #95a5a6; font-size: 12px; text-align: center;">
          If you didn't request a password reset, please ignore this email and contact support.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
};