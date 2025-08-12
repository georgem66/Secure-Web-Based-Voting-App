import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Security,
  HowToVote,
  VerifiedUser,
  Lock,
  BarChart,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const VotingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [voteComplete, setVoteComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Candidate', 'Confirm Vote', 'Vote Cast'];

  useEffect(() => {

    if (user?.hasVoted) {
      setVoteComplete(true);
      setActiveStep(2);
    }
    
    fetchCandidates();
  }, [user]);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/voting/candidates');
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/voting/vote', {
        candidateId: selectedCandidate,
      });

      if (response.data.success) {
        setTransactionHash(response.data.transactionHash);
        setVoteComplete(true);
        setActiveStep(2);
        toast.success('Vote cast successfully!');
        setConfirmDialogOpen(false);

        window.location.reload();
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidate(candidateId);
    setActiveStep(1);
  };

  const handleConfirmVote = () => {
    setConfirmDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (user?.hasVoted || voteComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Vote Successfully Cast!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for participating in the democratic process. Your vote has been securely recorded and encrypted.
          </Typography>
          
          {transactionHash && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction Hash:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  wordBreak: 'break-all',
                  bgcolor: 'white',
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}
              >
                {transactionHash}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Save this hash for vote verification
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/results')}
              startIcon={<BarChart />}
            >
              View Results
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              startIcon={<Home />}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <HowToVote sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Cast Your Vote
            </Typography>
            <Typography variant="subtitle1">
              Select your preferred candidate for the election
            </Typography>
          </Box>
        </Box>

        {}
        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
          <Chip 
            icon={<Lock />} 
            label="End-to-End Encrypted" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
          <Chip 
            icon={<Security />} 
            label="Blockchain Verified" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
          <Chip 
            icon={<VerifiedUser />} 
            label="Anonymous" 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
        </Box>
      </Paper>

      {}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> You can only vote once. Your vote will be encrypted and permanently recorded 
          in our secure blockchain-inspired ledger. Please review your selection carefully before confirming.
        </Typography>
      </Alert>

      {}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Select Your Candidate
      </Typography>

      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup
          value={selectedCandidate}
          onChange={(e) => handleCandidateSelect(e.target.value)}
        >
          <Grid container spacing={3}>
            {candidates.map((candidate) => (
              <Grid item xs={12} md={6} key={candidate.id}>
                <Card 
                  elevation={selectedCandidate === candidate.id.toString() ? 8 : 2}
                  sx={{
                    border: selectedCandidate === candidate.id.toString() ? 2 : 1,
                    borderColor: selectedCandidate === candidate.id.toString() ? 'primary.main' : 'grey.300',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => handleCandidateSelect(candidate.id.toString())}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FormControlLabel
                        value={candidate.id.toString()}
                        control={<Radio />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      <Avatar
                        sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
                      >
                        <Person fontSize="large" />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" component="h3">
                          {candidate.name}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {candidate.party}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {candidate.description && (
                      <Typography variant="body2" color="text.secondary">
                        {candidate.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </FormControl>

      {}
      {selectedCandidate && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedCandidate('');
              setActiveStep(0);
            }}
          >
            Clear Selection
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirmVote}
            startIcon={<HowToVote />}
            sx={{ minWidth: 200 }}
          >
            Confirm Vote
          </Button>
        </Box>
      )}

      {}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Security color="warning" sx={{ mr: 1 }} />
            Confirm Your Vote
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to cast your vote for:
          </DialogContentText>
          
          {selectedCandidate && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              {(() => {
                const candidate = candidates.find(c => c.id.toString() === selectedCandidate);
                return candidate ? (
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {candidate.party}
                      </Typography>
                    </Box>
                  </Box>
                ) : null;
              })()}
            </Box>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>This action cannot be undone.</strong> Once confirmed, your vote will be permanently 
              recorded and encrypted. You will not be able to change your selection.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVoteSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <HowToVote />}
            sx={{ minWidth: 120 }}
          >
            {submitting ? 'Casting Vote...' : 'Cast Vote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VotingPage;
