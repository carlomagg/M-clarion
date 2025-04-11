import axios from 'axios';
import { BASE_API_URL, ACCESS_TOKEN_NAME } from '../../utils/consts';
import { get } from 'lockr';

// Use relative URL path
const apiUrl = '';

// Create axios instance with retry logic
const axiosInstance = axios.create({
    timeout: 30000,
    baseURL: BASE_API_URL,
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
        
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error);
            throw new Error('Network error. Please check your connection.');
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
            throw new Error('Request timeout. Please try again.');
        }

        // Handle unauthorized errors
        if (error.response.status === 401) {
            console.error('Authentication error:', error);
            throw new Error('Authentication failed. Please log in again.');
        }

        return Promise.reject(error);
    }
);

export const permissionsOptions = () => ({
    queryKey: ['permissions', 'clarion_users'],
    queryFn: async () => {
        try {
            console.log('Fetching permissions from:', '/clarion_users/permissions/');
            const response = await axiosInstance.get('/clarion_users/permissions/');
            
            // Debug log to see raw response
            console.log('Raw permissions response:', response.data);
            
            // Ensure response data has expected structure
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid permissions response format');
            }
            
            // Transform API response to match expected format
            const { user = [], risk = [], core = [] } = response.data;
            
            // Validate and transform each permission type
            const transformPermission = (p) => ({
                permission_id: parseInt(p.permission_id, 10),
                name: p.name || '',
                description: p.description || '',
                read_only: !!p.read_only,
            });
            
            // Map permissions to the correct format with validation
            const userPermissions = Array.isArray(user) ? user.map(p => ({
                ...transformPermission(p),
                type: 'user'
            })) : [];

            const riskPermissions = Array.isArray(risk) ? risk.map(p => ({
                ...transformPermission(p),
                type: 'risk'
            })) : [];

            const corePermissions = Array.isArray(core) ? core.map(p => ({
                ...transformPermission(p),
                type: 'core'
            })) : [];

            console.log('Transformed permissions:', {
                user: userPermissions.length,
                risk: riskPermissions.length,
                core: corePermissions.length
            });

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
                code: error.code,
                url: '/clarion_users/permissions/'
            });
            throw new Error(error.response?.data?.message || 'Failed to fetch permissions. Please check your connection and try again.');
        }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000 // Keep in cache for 10 minutes
});