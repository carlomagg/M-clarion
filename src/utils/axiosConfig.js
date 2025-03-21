import axios from 'axios';
import { get, remove } from 'lockr';
import { ACCESS_TOKEN_NAME, BASE_API_URL, REFRESH_TOKEN_NAME } from './consts';
import http from 'http';
import https from 'https';

// Create custom agents for HTTP/1.1
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ 
  keepAlive: true,
  rejectUnauthorized: true,
  maxVersion: 'TLSv1.2'
});

// Helper function to clear auth tokens
const clearAuthTokens = () => {
    remove(ACCESS_TOKEN_NAME);
    remove(REFRESH_TOKEN_NAME);
};

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
    httpAgent: httpAgent,
    httpsAgent: httpsAgent,
    transitional: {
        clarifyTimeoutError: true
    }
});

// Response interceptor with retry logic
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const config = error.config;
        
        if (!config || !error.response) {
            // Handle network errors
            const event = new CustomEvent('sessionExpired', {
                detail: { 
                    message: 'Network error. Please check your connection.',
                    type: 'error'
                }
            });
            window.dispatchEvent(event);
            return Promise.reject(error);
        }

        // Special handling for token refresh errors
        if (config.url === '/clarion_users/token/refresh/') {
            // Show session expired message using custom event
            const event = new CustomEvent('sessionExpired', {
                detail: { 
                    message: 'Your session has expired and could not be renewed. Please log in again.',
                    type: 'error'
                }
            });
            window.dispatchEvent(event);
            
            // Clear auth tokens
            clearAuthTokens();
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.replace('/login');
            }, 2000);
            
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors
        if (error.response.status === 401) {
            // Don't handle 401s for login-related endpoints except token refresh (handled above)
            const loginEndpoints = ['/clarion_users/login/', '/clarion_users/verify_login_otp/'];
            if (!loginEndpoints.includes(config.url)) {
                // Try to refresh the token first
                try {
                    const refreshToken = get(REFRESH_TOKEN_NAME);
                    if (refreshToken?.token) {
                        const response = await axios.post('/clarion_users/token/refresh/', {
                            refresh: refreshToken.token
                        });
                        if (response.data.access) {
                            // Update access token using lockr
                            set(ACCESS_TOKEN_NAME, response.data.access);
                            // Retry the original request
                            config.headers.Authorization = `Bearer ${response.data.access}`;
                            return axiosInstance(config);
                        }
                    }
                    // If no refresh token or refresh failed, logout
                    throw new Error('Token refresh failed');
                } catch (refreshError) {
                    // If refresh fails, show expired message and logout
                    const event = new CustomEvent('sessionExpired', {
                        detail: { 
                            message: 'Your session has expired. Please log in again.',
                            type: 'warning'
                        }
                    });
                    window.dispatchEvent(event);
                    
                    // Clear auth tokens
                    clearAuthTokens();
                    
                    // Use replace instead of href to ensure clean navigation
                    setTimeout(() => {
                        window.location.replace('/login');
                    }, 2000);
                }
                return Promise.reject(new Error('Session expired. Please log in again.'));
            }
        }

        // Handle 500 Internal Server errors
        if (error.response.status >= 500) {
            const event = new CustomEvent('sessionExpired', {
                detail: { 
                    message: 'Server error occurred. Please try again later or contact support if the problem persists.',
                    type: 'error'
                }
            });
            window.dispatchEvent(event);
            
            // Only retry for specific endpoints that might recover
            const retryableEndpoints = [
                '/clarion_users/list-all-expert-guides/',
                '/clarion_users/view_all-help-topic-categories/'
            ];
            
            if (retryableEndpoints.includes(config.url)) {
                config.retryCount = config.retryCount || 0;
                
                if (config.retryCount < 2) {  // Reduced retry count for 500 errors
                    config.retryCount += 1;
                    const delay = Math.pow(2, config.retryCount) * 1000;
                    
                    // Show retry message
                    const retryEvent = new CustomEvent('sessionExpired', {
                        detail: { 
                            message: `Retrying request... Attempt ${config.retryCount} of 2`,
                            type: 'warning'
                        }
                    });
                    window.dispatchEvent(retryEvent);
                    
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return axiosInstance(config);
                }
            }
        }

        // Handle other network errors
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            config.retryCount = config.retryCount || 0;
            
            if (config.retryCount < 3) {
                config.retryCount += 1;
                const delay = Math.pow(2, config.retryCount) * 1000;
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return axiosInstance(config);
            }
        }
        
        return Promise.reject(error);
    }
);

// Request interceptor
axiosInstance.interceptors.request.use(
    config => {
        const token = get(ACCESS_TOKEN_NAME);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default axiosInstance;