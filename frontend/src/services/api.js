import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session management
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('csrfToken');
        localStorage.removeItem('user');
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  setupMFA: () => api.post('/auth/mfa/setup'),
  verifyMFA: (totpCode) => api.post('/auth/mfa/verify', { totpCode }),
  disableMFA: (password) => api.post('/auth/mfa/disable', { password }),
};

export const votingAPI = {
  getCandidates: () => api.get('/voting/candidates'),
  castVote: (candidateId) => api.post('/voting/vote', { candidateId }),
  verifyVote: (transactionHash) => api.get(`/voting/verify/${transactionHash}`),
  getVotingStatus: () => api.get('/voting/status'),
};

export const resultsAPI = {
  getCurrentResults: () => api.get('/results/current'),
  getStatistics: () => api.get('/results/statistics'),
};

export const adminAPI = {
  getAllCandidates: () => api.get('/admin/candidates'),
  createCandidate: (candidateData) => api.post('/admin/candidates', candidateData),
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getDetailedResults: () => api.get('/admin/results/detailed'),
};

export const handleAPIError = (error) => {
  if (error.response) {

    const { status, data } = error.response;
    return {
      message: data.message || 'An error occurred',
      status,
      errors: data.errors || [],
    };
  } else if (error.request) {

    return {
      message: 'Network error - please check your connection',
      status: 0,
    };
  } else {

    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

export default api;
