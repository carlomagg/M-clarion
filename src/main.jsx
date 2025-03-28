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

// LOCKR GLOBAL CONFIG
setPrefix('mc_');

// AXIOS GLOBAL CONFIG
axios.defaults.baseURL = BASE_API_URL;
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Accept'] = 'application/json';
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
    baseURL: BASE_API_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
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
    validateStatus: (status) => status >= 200 && status < 300
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
        // Ensure URL starts with /
        if (!config.url.startsWith('/')) {
            config.url = '/' + config.url;
        }

        if (!config._retry && !unauthorizedEndpoints.includes(config.url.replace('/', ''))) {
            const accessToken = get('access');
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Handle response errors and retry logic
axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Don't retry for unauthorized endpoints or already retried requests
        if (unauthorizedEndpoints.includes(originalRequest.url.replace('/', '')) || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Handle unauthorized errors
        if (error.response?.status === 401) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = get('refresh');
                if (!refreshToken) {
                    auth.logout();
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axiosInstance.post('clarion_users/token/refresh/', 
                    { refresh: refreshToken },
                    { _retry: true } // Prevent infinite loop
                );
                
                const { access } = response.data;
                if (access) {
                    // Update access token and retry original request
                    set('access', access);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return axiosInstance(originalRequest);
                } else {
                    auth.logout();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // If refresh fails, clear tokens and logout
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
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>

    </Provider>
  </React.StrictMode>,
)
