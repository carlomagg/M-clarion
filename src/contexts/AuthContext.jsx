import React, { createContext, useContext, useState, useEffect } from 'react';
import { get, set } from 'lockr';
import auth from '../utils/auth';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../utils/consts';
import axios from 'axios';

const AuthContext = createContext();

const REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh token 5 minutes before expiration

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const dispatchMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const refreshToken = async () => {
    try {
      const refreshToken = get(REFRESH_TOKEN_NAME);
      if (!refreshToken?.token) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/clarion_users/auth/token/refresh/', {
        refresh: refreshToken.token
      });

      if (response.data?.access) {
        set(ACCESS_TOKEN_NAME, response.data.access);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = get(ACCESS_TOKEN_NAME);
      console.log('Token from storage:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token is valid (not expired)
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        // If token is expired or close to expiration, try to refresh
        if (currentTime >= expirationTime - REFRESH_THRESHOLD) {
          console.log('Token expired or close to expiration, attempting refresh');
          const refreshSuccess = await refreshToken();
          
          if (!refreshSuccess) {
            console.log('Token refresh failed');
            auth.logout();
            dispatchMessage('error', 'Your session has expired. Please log in again.');
            window.location.href = '/login';
            return;
          }
          
          console.log('Token refreshed successfully');
        }
        
        // If we get here, token exists and is valid
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing token:', e);
        setIsAuthenticated(false);
        auth.logout();
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted, starting initial check');
    checkAuthStatus();
    
    // Set up periodic token check every minute
    const tokenCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 60000);
    
    // Reset retry count when component remounts
    return () => {
      clearInterval(tokenCheckInterval);
      setRetryCount(0);
    };
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    refreshToken,
    message,
    dispatchMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          message.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-3 text-sm hover:bg-opacity-20 hover:bg-black rounded-full h-5 w-5 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};