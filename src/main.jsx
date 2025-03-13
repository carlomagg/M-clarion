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

const unauthorizedEndpoints = ['clarion_users/login/', 'clarion_users/verify_login_otp/', 'clarion_users/token/refresh/', 'clarion_users/user_forgot_password/', 'clarion_users/change_forgot_password/'];
// add access tokens to all authorized endpoints
axios.interceptors.request.use(
    function (config){
        if (!config._retry && !unauthorizedEndpoints.includes(config.url)) {
            const accessToken = get('access');
            console.log('Token from storage:', accessToken); // Debug log
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('Setting Authorization header:', config.headers['Authorization']); // Debug log
            }
        }

        return config;
    }
);

// refresh access token when response returns 401 (unauthorize token)
axios.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle network errors or missing response
        if (error.code === 'ERR_NETWORK' || !error.response) {
            console.error('Network error or no response:', error.message);
            return Promise.reject(error);
        }

        // Handle unauthorized errors for non-auth endpoints
        if (!unauthorizedEndpoints.includes(originalRequest?.url)) {
            if (error.response.status === 401 && !originalRequest?._retry) {
                originalRequest._retry = true;
                
                try {
                    // make a request to renew access token using refresh token
                    const refreshToken = get('refresh');
                    if (!refreshToken) {
                        throw new Error('No refresh token found');
                    }
                    
                    const response = await axios.post('clarion_users/token/refresh/', {refresh: refreshToken.token});
                    const { access } = response.data;
                    
                    // set new access token
                    set('access', access);
        
                    // retry original request with new access token
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
                    return axios(originalRequest);
                } catch (refreshError) {
                    // If refresh fails, logout user
                    console.error('Token refresh failed:', refreshError);
                    auth.logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        
        // Handle refresh token expiry
        if (error.response.status === 401 && originalRequest?.url === 'clarion_users/token/refresh/') {
            auth.logout();
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// REACT QUERY GLOBAL CONFIG
const queryClient = new QueryClient(
    {
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 1,
            }
        }
    }
);

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
