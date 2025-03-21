import axios from 'axios';
import { get } from 'lockr';
import { ACCESS_TOKEN_NAME, BASE_API_URL } from './consts';
import http from 'http';
import https from 'https';

// Create custom agents for HTTP/1.1
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ 
  keepAlive: true,
  rejectUnauthorized: true,
  maxVersion: 'TLSv1.2'
});

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
            
            // Clear any stored tokens
            localStorage.removeItem('mc_access');
            localStorage.removeItem('mc_refresh');
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
            
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors
        if (error.response.status === 401) {
            // Don't handle 401s for login-related endpoints except token refresh (handled above)
            const loginEndpoints = ['/clarion_users/login/', '/clarion_users/verify_login_otp/'];
            if (!loginEndpoints.includes(config.url)) {
                // Show session expired message using custom event
                const event = new CustomEvent('sessionExpired', {
                    detail: { 
                        message: 'Your session has expired. Please log in again.',
                        type: 'warning'
                    }
                });
                window.dispatchEvent(event);
                
                // Clear any stored tokens
                localStorage.removeItem('mc_access');
                localStorage.removeItem('mc_refresh');
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                
                return Promise.reject(new Error('Session expired. Please log in again.'));
            }
        }

        // Retry on network errors or 5xx errors
        if (error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' ||
            (error.response.status >= 500 && error.response.status < 600)) {
            
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