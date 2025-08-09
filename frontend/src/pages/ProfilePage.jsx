import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person,
  Security,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Schedule,
  VpnKey,
  History,
  Settings,
  Verified,
  Shield,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form validation schema
  const schema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const handleEditToggle = () => {
    if (editMode) {
      reset(); // Reset form when cancelling
    }
    setEditMode(!editMode);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/enable-mfa');
      if (response.data.success) {
        toast.success('MFA setup initiated');
        // Handle MFA setup flow
        setMfaDialogOpen(true);
      }
    } catch (error) {
      console.error('Error enabling MFA:', error);
      toast.error('Failed to enable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      setLoading(true);
      await api.post('/auth/disable-mfa');
      toast.success('MFA disabled successfully');
      updateUser({ ...user, mfaEnabled: false });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const securityFeatures = [
    {
      title: 'Email Verification',
      status: user?.emailVerified,
      icon: <Email />,
      description: 'Your email address is verified',
    },
    {
      title: 'Two-Factor Authentication',
      status: user?.mfaEnabled,
      icon: <Shield />,
      description: 'Additional security layer for your account',
    },
    {
      title: 'Secure Password',
      status: true, // Always true if they can login
      icon: <VpnKey />,
      description: 'Strong password protection',
    },
    {
      title: 'Vote Cast',
      status: user?.hasVoted,
      icon: <CheckCircle />,
      description: 'Your vote has been securely recorded',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 3, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '2rem' }}
          >
            <Person fontSize="large" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" component="h1" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              {user?.email}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {user?.emailVerified && (
                <Chip 
                  icon={<Verified />} 
                  label="Verified" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                />
              )}
              {user?.mfaEnabled && (
                <Chip 
                  icon={<Security />} 
                  label="MFA Enabled" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                />
              )}
              <Chip 
                label={user?.role?.toUpperCase() || 'VOTER'} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={editMode ? <Cancel /> : <Edit />}
            onClick={handleEditToggle}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>

            {editMode ? (
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      {...register('firstName')}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      {...register('lastName')}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                    startIcon={<Cancel />}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <List>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={`${user?.firstName} ${user?.lastName}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Phone /></ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={user?.phone || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user?.createdAt).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            )}
          </Paper>

          {/* Account Activity */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Account Activity
              </Typography>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => setActivityDialogOpen(true)}
                size="small"
              >
                View History
              </Button>
            </Box>

            <List>
              <ListItem>
                <ListItemText
                  primary="Last Login"
                  secondary={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Vote Status"
                  secondary={user?.hasVoted ? 'Vote cast successfully' : 'No vote cast yet'}
                />
                {user?.hasVoted && (
                  <CheckCircle sx={{ color: 'success.main' }} />
                )}
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Account Status"
                  secondary="Active and verified"
                />
                <CheckCircle sx={{ color: 'success.main' }} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Status
            </Typography>

            {securityFeatures.map((feature, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2, 
                        bgcolor: feature.status ? 'success.main' : 'grey.300' 
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body1">{feature.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={feature.status ? 'Active' : 'Inactive'}
                    color={feature.status ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                {index < securityFeatures.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Paper>

          {/* Security Actions */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={user?.mfaEnabled || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleEnableMFA();
                      } else {
                        handleDisableMFA();
                      }
                    }}
                  />
                }
                label="Two-Factor Authentication"
              />
              <Typography variant="caption" display="block" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<VpnKey />}
              sx={{ mb: 2 }}
            >
              Change Password
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Settings />}
            >
              Privacy Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* MFA Setup Dialog */}
      <Dialog open={mfaDialogOpen} onClose={() => setMfaDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Two-factor authentication adds an extra layer of security to your account.
          </Alert>
          <Typography>
            Please follow the instructions to set up MFA using your preferred authenticator app.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMfaDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Continue</Button>
        </DialogActions>
      </Dialog>

      {/* Activity History Dialog */}
      <Dialog 
        open={activityDialogOpen} 
        onClose={() => setActivityDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Account Activity History</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Account Created"
                secondary={new Date(user?.createdAt).toLocaleString()}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Email color="info" /></ListItemIcon>
              <ListItemText
                primary="Email Verified"
                secondary={user?.emailVerified ? 'Verified' : 'Pending verification'}
              />
            </ListItem>
            {user?.hasVoted && (
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary="Vote Cast"
                  secondary="Your vote was successfully recorded"
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;