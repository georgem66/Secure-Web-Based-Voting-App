import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Security,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  VpnKey,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Validation schemas
const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const mfaSchema = yup.object({
  totpCode: yup.string().length(6, 'Code must be 6 digits').required('TOTP code is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithMFA, mfaRequired, error, isLoading, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const loginForm = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mfaForm = useForm({
    resolver: yupResolver(mfaSchema),
    defaultValues: {
      totpCode: '',
    },
  });

  const handleLogin = async (data) => {
    clearError();
    const result = await login(data);
    
    if (result.success) {
      navigate('/');
    } else if (result.requiresMFA) {
      setLoginCredentials(data);
      setActiveStep(1);
    }
  };

  const handleMFALogin = async (data) => {
    const result = await loginWithMFA(loginCredentials, data.totpCode);
    
    if (result.success) {
      navigate('/');
    }
  };

  const steps = ['Login Credentials', 'Two-Factor Authentication'];

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
            <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Secure Voting System
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sign in to cast your vote
            </Typography>
          </Box>

          {mfaRequired && (
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!mfaRequired ? (
            // Login form
            <Box component="form" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <TextField
                {...loginForm.register('email')}
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                error={!!loginForm.formState.errors.email}
                helperText={loginForm.formState.errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                {...loginForm.register('password')}
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!loginForm.formState.errors.password}
                helperText={loginForm.formState.errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
                size="large"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          ) : (
            // MFA form
            <Box component="form" onSubmit={mfaForm.handleSubmit(handleMFALogin)}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please enter the 6-digit code from your authenticator app.
              </Alert>
              <TextField
                {...mfaForm.register('totpCode')}
                margin="normal"
                required
                fullWidth
                label="Authenticator Code"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                error={!!mfaForm.formState.errors.totpCode}
                helperText={mfaForm.formState.errors.totpCode?.message}
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setActiveStep(0);
                    setLoginCredentials(null);
                    clearError();
                  }}
                  sx={{ flex: 1 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{ flex: 1 }}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" underline="hover">
                Sign up here
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              🔒 Your connection is secured with end-to-end encryption
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;