import axios from 'axios';
import { BASE_API_URL, ACCESS_TOKEN_NAME } from '../../utils/consts';
import { get } from 'lockr';

// Remove trailing slash from BASE_API_URL if it exists
const apiUrl = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;

// Create axios instance with retry logic
const axiosInstance = axios.create({
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to handle auth
axiosInstance.interceptors.request.use(
    (config) => {
        const token = get(ACCESS_TOKEN_NAME);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
            originalRequest._retry = true;
            return axiosInstance(originalRequest);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Handle token refresh here if needed
            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

export const permissionsOptions = () => ({
    queryKey: ['permissions', 'clarion_users'],
    queryFn: async () => {
        try {
            const response = await axiosInstance.get(`${apiUrl}/clarion_users/permissions/`);
            
            // Debug log to see raw response
            console.log('Raw permissions response:', response.data);
            
            // Transform API response to match expected format
            const { user = [], risk = [], core = [] } = response.data;
            
            // Map permissions to the correct format
            const userPermissions = user.map(p => ({
                permission_id: p.permission_id,
                name: p.name,
                description: p.description,
                read_only: p.read_only,
                type: 'user'
            }));

            const riskPermissions = risk.map(p => ({
                permission_id: p.permission_id,
                name: p.name,
                description: p.description,
                read_only: p.read_only,
                type: 'risk'
            }));

            const corePermissions = core.map(p => ({
                permission_id: p.permission_id,
                name: p.name,
                description: p.description,
                read_only: p.read_only,
                type: 'core'
            }));

            return {
                user: userPermissions,
                risk: riskPermissions,
                core: corePermissions
            };
        } catch (error) {
            console.error('Permission fetch error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                code: error.code
            });
            throw new Error(error.response?.data?.message || 'Failed to fetch permissions. Please check your connection and try again.');
        }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
});