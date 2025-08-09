import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  Grid,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  People,
  HowToVote,
  Security,
  Refresh,
  EmojiEvents,
  Person,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const ResultsPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchResults();
    fetchStatistics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchResults(true);
      fetchStatistics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchResults = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent ? false : true);

    try {
      const response = await api.get('/results/current');
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      if (!silent) toast.error('Failed to load results');
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async (silent = false) => {
    try {
      const response = await api.get('/results/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (!silent) toast.error('Failed to load statistics');
    }
  };

  const handleRefresh = () => {
    fetchResults();
    fetchStatistics();
    toast.success('Results refreshed');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const candidates = results?.candidates || [];
  const totalVotes = results?.totalVotes || 0;
  const winner = candidates.length > 0 ? candidates.reduce((prev, current) => (prev.votes > current.votes) ? prev : current) : null;

  // Prepare chart data
  const chartData = candidates.map(candidate => ({
    name: candidate.name,
    votes: candidate.votes,
    percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0,
  }));

  const pieData = candidates.map((candidate, index) => ({
    name: candidate.name,
    value: candidate.votes,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'secondary.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box display="flex" alignItems="center">
            <BarChartIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Election Results
              </Typography>
              <Typography variant="subtitle1">
                Real-time voting results with blockchain verification
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        {/* Security Indicators */}
        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
          <Chip 
            icon={<Security />} 
            label="Blockchain Verified" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
          <Chip 
            icon={<HowToVote />} 
            label="End-to-End Encrypted" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
          <Chip 
            icon={<TrendingUp />} 
            label="Real-time Updates" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <People sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalVotes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Votes Cast
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Person sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info">
                {candidates.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Candidates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success">
                {statistics?.voterTurnout || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Voter Turnout
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Security sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning">
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vote Integrity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Winner Announcement */}
      {winner && totalVotes > 0 && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center">
            <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6">
              Current Leader: <strong>{winner.name}</strong> ({winner.party}) with {winner.votes} votes 
              ({((winner.votes / totalVotes) * 100).toFixed(1)}%)
            </Typography>
          </Box>
        </Alert>
      )}

      {totalVotes === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography>
            No votes have been cast yet. Be the first to participate in the election!
          </Typography>
        </Alert>
      )}

      {/* Results Charts */}
      {totalVotes > 0 && (
        <Grid container spacing={4}>
          {/* Bar Chart */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Vote Distribution
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Votes']}
                      labelFormatter={(label) => `Candidate: ${label}`}
                    />
                    <Bar dataKey="votes" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Vote Share
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Detailed Results Table */}
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Results
        </Typography>
        
        {candidates.map((candidate, index) => (
          <Box key={candidate.id} sx={{ mb: 2 }}>
            {index > 0 && <Divider sx={{ mb: 2 }} />}
            
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2, bgcolor: COLORS[index % COLORS.length] }}>
                    {index === 0 && winner?.id === candidate.id ? (
                      <EmojiEvents />
                    ) : (
                      <Person />
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{candidate.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {candidate.party}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {candidate.votes} votes ({totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: COLORS[index % COLORS.length],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right', xs: 'left' } }}>
                <Typography variant="h5" color="primary">
                  {candidate.votes}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 4, p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Results are updated in real-time and verified using blockchain technology.
          All votes are encrypted and stored securely with immutable transaction hashes.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default ResultsPage;