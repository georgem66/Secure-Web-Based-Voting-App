import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Security,
} from '@mui/icons-material';
import { authAPI } from '../services/api';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in to your account.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your account...
            </Typography>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Email Verified Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {message}
            </Typography>
            <Button
              variant="contained"
              href="/login"
              size="large"
              sx={{ mt: 2 }}
            >
              Continue to Login
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <Error sx={{ fontSize: 64, color: 'error.main', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verification Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {message}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                href="/login"
              >
                Go to Login
              </Button>
              <Button
                variant="contained"
                href="/register"
              >
                Create New Account
              </Button>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={6} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Security sx={{ fontSize: 32, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h6" color="text.secondary">
              Secure Voting System
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            {renderContent()}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;