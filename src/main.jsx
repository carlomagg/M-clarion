import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import axios from 'axios'
import { get, set, setPrefix } from 'lockr'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ROUTES from './routes';
import { BASE_API_URL } from './utils/consts.js'
import auth from './utils/auth.js'
import { Provider } from 'react-redux'
import { store } from './config/store.js'
import { MessageProvider } from './contexts/MessageContext.jsx'
import { AuthProvider } from './contexts/AuthContext'

// LOCKR GLOBAL CONFIG
setPrefix('mc_');

// AXIOS GLOBAL CONFIG
// Ensure the BASE_API_URL is properly formatted
let apiUrl = BASE_API_URL;
// Remove any @ symbols that might cause URL formatting issues
if (apiUrl.includes('@')) {
    console.warn('BASE_API_URL contains @ symbol which may cause issues:', apiUrl);
    apiUrl = apiUrl.replace(/@/g, '');
}
// Ensure URL ends with a slash
if (!apiUrl.endsWith('/')) {
    apiUrl = apiUrl + '/';
}
console.log('Using API URL:', apiUrl);

axios.defaults.baseURL = apiUrl;
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.maxRedirects = 5;
axios.defaults.maxContentLength = 50 * 1024 * 1024; // 50MB
// Force HTTP/1.1
axios.defaults.httpVersion = '1.1';
axios.defaults.transport = {
    httpVersion: '1.1',
    protocols: ['http/1.1']
};

// Custom axios instance with retry logic and error handling
const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
    },
    maxRedirects: 5,
    maxContentLength: 50 * 1024 * 1024,
    // Force HTTP/1.1 for better compatibility
    httpVersion: '1.1',
    transport: {
        httpVersion: '1.1',
        protocols: ['http/1.1']
    },
    // Implement retry logic
    retry: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    validateStatus: (status) => status >= 200 && status < 300,
    // Enable credentials to ensure cookies are sent with requests
    withCredentials: true
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const { config, response } = error;
        
        if (!config || !config.retry) {
            return Promise.reject(error);
        }

        config.retryCount = config.retryCount || 0;

        if (config.retryCount >= config.retry) {
            return Promise.reject(error);
        }

        config.retryCount += 1;

        const delayRetry = new Promise(resolve => {
            setTimeout(resolve, config.retryDelay(config.retryCount));
        });

        await delayRetry;

        return axiosInstance(config);
    }
);

// Replace global axios with our custom instance
axios.defaults = axiosInstance.defaults;

const unauthorizedEndpoints = ['clarion_users/login/', 'clarion_users/verify_login_otp/', 'clarion_users/token/refresh/', 'clarion_users/user_forgot_password/', 'clarion_users/verify_forgot_password_otp/', 'clarion_users/change_forgot_password/'];

// add access tokens to all authorized endpoints
axiosInstance.interceptors.request.use(
    function (config) {
        // Handle URL formatting
        // If URL contains protocol, leave it as is
        if (!config.url.includes('://')) {
            // Remove leading slash if present, as baseURL already has a trailing slash
            if (config.url.startsWith('/')) {
                config.url = config.url.substring(1);
            }
            
            // Handle any double slashes that might occur
            while (config.url.includes('//')) {
                config.url = config.url.replace('//', '/');
            }
        }

        console.log(`Request to: ${config.method?.toUpperCase() || 'GET'} ${config.baseURL}${config.url}`);
        console.log('Request headers:', config.headers);
        
        // Set default content type if not already set
        if (!config.headers['Content-Type'] && !config._retry) {
            config.headers['Content-Type'] = 'application/json';
        }

        if (!config._retry && !unauthorizedEndpoints.includes(config.url.replace('/', ''))) {
            const accessToken = get('access');
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('Added authorization token to request');
            } else {
                console.warn('No access token found for authenticated endpoint');
            }
        }
        
        return config;
    },
    function (error) {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Handle response errors and retry logic
axiosInstance.interceptors.response.use(
    response => {
        console.log(`Response from ${response.config.method?.toUpperCase() || 'GET'} ${response.config.url}:`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response) {
            console.error(`API Error for ${originalRequest?.method?.toUpperCase() || 'GET'} ${originalRequest?.url}:`, {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('No response received from API:', error.request);
        } else {
            console.error('Error in API request setup:', error.message);
        }
        
        // Don't retry for unauthorized endpoints or already retried requests
        if (unauthorizedEndpoints.includes(originalRequest?.url.replace('/', '')) || originalRequest?._retry) {
            return Promise.reject(error);
        }

        // Handle unauthorized errors
        if (error.response?.status === 401) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = get('refresh');
                if (!refreshToken) {
                    console.warn('No refresh token available, logging out');
                    auth.logout();
                    return Promise.reject(error);
                }

                console.log('Attempting to refresh token');
                // Try to refresh the token
                const response = await axiosInstance.post('clarion_users/token/refresh/', 
                    { refresh: refreshToken },
                    { _retry: true } // Prevent infinite loop
                );
                
                const { access } = response.data;
                if (access) {
                    // Update access token and retry original request
                    console.log('Token refreshed successfully, retrying original request');
                    set('access', access);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return axiosInstance(originalRequest);
                } else {
                    console.warn('Token refresh response did not contain access token, logging out');
                    auth.logout();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // If refresh fails, clear tokens and logout
                console.error('Token refresh failed:', refreshError);
                auth.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Replace global axios interceptors with our instance's interceptors
axios.interceptors.request = axiosInstance.interceptors.request;
axios.interceptors.response = axiosInstance.interceptors.response;

// REACT QUERY GLOBAL CONFIG
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        }
    }
});

// ROUTE CREATION (REACT ROUTER)
const router = createBrowserRouter(ROUTES)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MessageProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={true} />
          </AuthProvider>
        </MessageProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
