import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import { Security } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Security sx={{ fontSize: 48, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Secure Voting System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoadingScreen;