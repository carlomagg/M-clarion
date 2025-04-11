import React, { createContext, useContext, useState, useEffect } from 'react';
import { get } from 'lockr';
import auth from '../utils/auth';
import axios from 'axios';
import { ACCESS_TOKEN_NAME } from '../utils/consts';

const AuthContext = createContext();

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

      // Get user_id from token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.user_id;

      const response = await axios.post('/clarion_users/check-is-online/', {
        user_id: userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Auth check response status:', response.status);
      console.log('Auth check response data:', response.data);

      if (response.status >= 200 && response.status < 300) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Server error details:', {
          status,
          data,
          headers: error.response.headers
        });

        // Handle specific error cases
        if (status === 401) {
          // Token is invalid or expired
          auth.logout();
          window.location.href = '/login';
        } else if (status === 500) {
          // Server error - try again after a delay, but limit retries to 3
          if (retryCount < 3) {
            setRetryCount(prevCount => prevCount + 1);
            setTimeout(() => {
              checkAuthStatus();
            }, 5000);
          } else {
            console.log('Max retry count reached for auth check (500 error). Stopping retries.');
            // Optionally, you could show a user-friendly message here
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted, starting initial check');
    checkAuthStatus();
    
    // Reset retry count when component remounts
    return () => setRetryCount(0);
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    checkAuthStatus,
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