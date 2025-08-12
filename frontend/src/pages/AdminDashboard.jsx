import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AdminPanelSettings,
  Add,
  Edit,
  Delete,
  People,
  HowToVote,
  Security,
  Analytics,
  Person,
  Block,
  CheckCircle,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [statistics, setStatistics] = useState({});

  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const candidateSchema = yup.object({
    name: yup.string().required('Name is required'),
    party: yup.string().required('Party is required'),
    description: yup.string(),
  });

  const {
    register: registerCandidate,
    handleSubmit: handleCandidateSubmit,
    formState: { errors: candidateErrors },
    reset: resetCandidateForm,
  } = useForm({
    resolver: yupResolver(candidateSchema),
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCandidates(),
        fetchUsers(),
        fetchAuditLogs(),
        fetchStatistics(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/admin/candidates');
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/statistics');
      setStatistics(response.data || {});
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateCandidate = async (data) => {
    try {
      const response = await api.post('/admin/candidates', data);
      if (response.data.success) {
        toast.success('Candidate created successfully');
        setCandidateDialogOpen(false);
        resetCandidateForm();
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to create candidate');
    }
  };

  const handleUpdateCandidate = async (data) => {
    try {
      const response = await api.put(`/admin/candidates/${editingCandidate.id}`, data);
      if (response.data.success) {
        toast.success('Candidate updated successfully');
        setCandidateDialogOpen(false);
        setEditingCandidate(null);
        resetCandidateForm();
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const response = await api.delete(`/admin/candidates/${candidateId}`);
      if (response.data.success) {
        toast.success('Candidate deleted successfully');
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, { action });
      if (response.data.success) {
        toast.success(`User ${action}d successfully`);
        fetchUsers();
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const openCandidateDialog = (candidate = null) => {
    setEditingCandidate(candidate);
    if (candidate) {
      resetCandidateForm(candidate);
    } else {
      resetCandidateForm();
    }
    setCandidateDialogOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {}
      <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'error.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box display="flex" alignItems="center">
            <AdminPanelSettings sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Admin Dashboard
              </Typography>
              <Typography variant="subtitle1">
                System Administration & Management Panel
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllData}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Refresh Data
          </Button>
        </Box>
      </Paper>

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={statistics.totalUsers || 0} 
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Votes" 
            value={statistics.totalVotes || 0} 
            icon={<HowToVote />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Candidates" 
            value={candidates.length || 0} 
            icon={<Person />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Security Events" 
            value={auditLogs.length || 0} 
            icon={<Security />}
            color="warning"
          />
        </Grid>
      </Grid>

      {}
      <Paper elevation={3} sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Candidates" />
          <Tab label="Users" />
          <Tab label="Audit Logs" />
          <Tab label="System Stats" />
        </Tabs>
      </Paper>

      {}
      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Candidate Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openCandidateDialog()}
            >
              Add Candidate
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Party</TableCell>
                  <TableCell>Votes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                        {candidate.name}
                      </Box>
                    </TableCell>
                    <TableCell>{candidate.party}</TableCell>
                    <TableCell>{candidate.votes || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openCandidateDialog(candidate)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>User Management</Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Vote Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                          <Person />
                        </Avatar>
                        {userData.firstName} {userData.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={userData.role} 
                        color={userData.role === 'admin' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={userData.emailVerified ? 'Verified' : 'Pending'} 
                        color={userData.emailVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {userData.hasVoted ? (
                        <CheckCircle sx={{ color: 'success.main' }} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not voted
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedUser(userData);
                          setUserDetailsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Security Audit Logs</Typography>

          <List>
            {auditLogs.slice(0, 20).map((log, index) => (
              <React.Fragment key={log.id || index}>
                <ListItem>
                  <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                    <Security />
                  </Avatar>
                  <ListItemText
                    primary={log.action || 'Security Event'}
                    secondary={`${log.userEmail || 'System'} - ${new Date(log.timestamp).toLocaleString()}`}
                  />
                  <Chip 
                    label={log.level || 'INFO'} 
                    color={log.level === 'ERROR' ? 'error' : 'default'}
                    size="small"
                  />
                </ListItem>
                {index < auditLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {auditLogs.length === 0 && (
            <Alert severity="info">
              No audit logs available at the moment.
            </Alert>
          )}
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>System Statistics</Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Voting Statistics</Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Voter Turnout"
                        secondary={`${statistics.voterTurnout || 0}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Total Registered Users"
                        secondary={statistics.totalUsers || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Votes Cast"
                        secondary={statistics.totalVotes || 0}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Security Metrics</Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="MFA Enabled Users"
                        secondary={`${statistics.mfaEnabledUsers || 0} users`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Email Verified Users"
                        secondary={`${statistics.verifiedUsers || 0} users`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Security Events (24h)"
                        secondary={`${statistics.recentSecurityEvents || 0} events`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {}
      <Dialog open={candidateDialogOpen} onClose={() => setCandidateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Candidate Name"
              {...registerCandidate('name')}
              error={!!candidateErrors.name}
              helperText={candidateErrors.name?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Party"
              {...registerCandidate('party')}
              error={!!candidateErrors.party}
              helperText={candidateErrors.party?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              {...registerCandidate('description')}
              error={!!candidateErrors.description}
              helperText={candidateErrors.description?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCandidateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCandidateSubmit(
              editingCandidate ? handleUpdateCandidate : handleCreateCandidate
            )}
          >
            {editingCandidate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={userDetailsDialogOpen} onClose={() => setUserDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <List>
              <ListItem>
                <ListItemText 
                  primary="Full Name"
                  secondary={`${selectedUser.firstName} ${selectedUser.lastName}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Email"
                  secondary={selectedUser.email}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Role"
                  secondary={selectedUser.role}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Account Created"
                  secondary={new Date(selectedUser.createdAt).toLocaleString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Email Verified"
                  secondary={selectedUser.emailVerified ? 'Yes' : 'No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="MFA Enabled"
                  secondary={selectedUser.mfaEnabled ? 'Yes' : 'No'}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Vote Status"
                  secondary={selectedUser.hasVoted ? 'Vote cast' : 'Not voted'}
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
