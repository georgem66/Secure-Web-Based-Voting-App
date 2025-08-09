import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Alert,
} from '@mui/material';
import {
  HowToVote,
  BarChart,
  Security,
  CheckCircle,
  Schedule,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Security color="primary" />,
      title: 'End-to-End Encryption',
      description: 'Your votes are encrypted with military-grade AES-256 encryption',
    },
    {
      icon: <CheckCircle color="success" />,
      title: 'Blockchain Verification',
      description: 'Immutable vote ledger with hash chain verification',
    },
    {
      icon: <Person color="secondary" />,
      title: 'Multi-Factor Authentication',
      description: 'Enhanced security with MFA and identity verification',
    },
  ];

  const quickActions = [
    {
      title: 'Cast Your Vote',
      description: 'Participate in the current election',
      icon: <HowToVote />,
      action: () => navigate('/vote'),
      color: 'primary',
      disabled: user?.hasVoted,
    },
    {
      title: 'View Results',
      description: 'See real-time election results',
      icon: <BarChart />,
      action: () => navigate('/results'),
      color: 'secondary',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{ width: 60, height: 60, mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              <Person fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome back, {user?.firstName || 'Voter'}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Secure Web-Based Voting Platform
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            {user?.emailVerified ? (
              <Chip 
                icon={<CheckCircle />} 
                label="Email Verified" 
                color="success" 
                variant="filled" 
              />
            ) : (
              <Chip 
                icon={<Schedule />} 
                label="Email Pending Verification" 
                color="warning" 
                variant="filled" 
              />
            )}
            
            {user?.mfaEnabled && (
              <Chip 
                icon={<Security />} 
                label="MFA Enabled" 
                color="info" 
                variant="filled" 
              />
            )}

            {user?.hasVoted && (
              <Chip 
                icon={<HowToVote />} 
                label="Vote Cast" 
                color="success" 
                variant="filled" 
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Voting Status Alert */}
      {user?.hasVoted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Thank you for voting! Your vote has been securely recorded and encrypted.
          </Typography>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            The election is currently active. Cast your vote to participate in the democratic process.
          </Typography>
        </Alert>
      )}

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                opacity: action.disabled ? 0.6 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: action.disabled ? 'none' : 'translateY(-2px)',
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2, bgcolor: `${action.color}.main` }}>
                    {action.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h3">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="medium"
                  color={action.color}
                  onClick={action.action}
                  disabled={action.disabled}
                  variant="contained"
                  sx={{ ml: 1, mb: 1 }}
                >
                  {action.disabled && action.title.includes('Vote') ? 'Already Voted' : 'Go'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Security Features */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Security Features
      </Typography>
      
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card elevation={1} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2, 
                    bgcolor: 'transparent' 
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer Info */}
      <Box sx={{ mt: 6, p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This platform uses advanced cryptographic security measures including AES-256 encryption,
          RSA key exchange, and blockchain-inspired immutable ledger technology to ensure vote integrity.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;