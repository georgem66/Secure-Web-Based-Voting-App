import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Auth context
const AuthContext = createContext();

// Auth actions
const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  SET_MFA_REQUIRED: 'SET_MFA_REQUIRED',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  mfaRequired: false,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        mfaRequired: false,
      };
    case authActions.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case authActions.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case authActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case authActions.SET_MFA_REQUIRED:
      return {
        ...state,
        mfaRequired: action.payload,
        isLoading: false,
      };
    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        // Verify token is still valid by fetching profile
        const response = await authAPI.getProfile();
        dispatch({
          type: authActions.SET_USER,
          payload: response.data.data.user,
        });
      } catch (error) {
        // Token is invalid, clear auth
        logout();
      }
    } else {
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const response = await authAPI.login(credentials);
      const { data } = response.data;

      if (data.requiresMFA) {
        dispatch({
          type: authActions.SET_MFA_REQUIRED,
          payload: true,
        });
        return { requiresMFA: true };
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('csrfToken', data.csrfToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: data,
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: authActions.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const loginWithMFA = async (credentials, totpCode) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });

    try {
      const response = await authAPI.login({
        ...credentials,
        totpCode,
      });

      const { data } = response.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('csrfToken', data.csrfToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: data,
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'MFA verification failed';
      dispatch({
        type: authActions.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const response = await authAPI.register(userData);
      dispatch({ type: authActions.SET_LOADING, payload: false });
      toast.success('Registration successful! Please check your email to verify your account.');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: authActions.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('user');

      dispatch({ type: authActions.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  const updateUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.data.user;
      
      dispatch({
        type: authActions.SET_USER,
        payload: userData,
      });
      
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    mfaRequired: state.mfaRequired,
    login,
    loginWithMFA,
    register,
    logout,
    updateUser,
    clearError: () => dispatch({ type: authActions.CLEAR_ERROR }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};