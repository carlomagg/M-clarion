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
            
            // Direct inspection of specific fields to handle potential naming differences
            if (response.data.processes) {
                console.log('Found "processes" key in API response with', response.data.processes.length, 'items');
                console.log('Sample process permission:', response.data.processes[0]);
            } else if (response.data.process) {
                console.log('Found "process" key in API response with', response.data.process.length, 'items');
                console.log('Sample process permission:', response.data.process[0]);
            } else {
                // Look for other possible keys containing process permissions
                const possibleKeys = Object.keys(response.data).filter(key => 
                    key.toLowerCase().includes('process')
                );
                
                if (possibleKeys.length > 0) {
                    console.log('Found potential process-related keys:', possibleKeys);
                    possibleKeys.forEach(key => {
                        if (Array.isArray(response.data[key])) {
                            console.log(`Key "${key}" contains an array with ${response.data[key].length} items`);
                            if (response.data[key].length > 0) {
                                console.log('Sample item:', response.data[key][0]);
                            }
                        }
                    });
                } else {
                    console.warn('No process-related keys found in API response');
                    console.log('Available keys:', Object.keys(response.data));
                }
            }
            
            // Ensure response data has expected structure
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid permissions response format');
            }
            
            // Transform API response to match expected format
            // Note: Handle both 'process' and 'processes' keys and other possible variations
            const { 
                user = [], 
                risk = [], 
                core = []
            } = response.data;
            
            // Try to find process permissions under any key that might contain them
            let processPermissionsData = [];
            if (Array.isArray(response.data.processes) && response.data.processes.length > 0) {
                processPermissionsData = response.data.processes;
                console.log('Using "processes" key for process permissions');
            } else if (Array.isArray(response.data.process) && response.data.process.length > 0) {
                processPermissionsData = response.data.process;
                console.log('Using "process" key for process permissions');
            } else {
                // Look for other possible keys
                const possibleKeys = Object.keys(response.data).filter(key => 
                    key.toLowerCase().includes('process')
                );
                
                for (const key of possibleKeys) {
                    if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                        processPermissionsData = response.data[key];
                        console.log(`Using "${key}" key for process permissions`);
                        break;
                    }
                }
            }
            
            console.log('Process permissions data:', processPermissionsData);
            
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
            
            const processPermissions = Array.isArray(processPermissionsData) ? processPermissionsData.map(p => ({
                ...transformPermission(p),
                type: 'process'
            })) : [];

            console.log('Transformed permissions:', {
                user: userPermissions.length,
                risk: riskPermissions.length,
                core: corePermissions.length,
                process: processPermissions.length
            });
            
            if (processPermissions.length > 0) {
                console.log('Process permissions transformed (first 3):', 
                    processPermissions.slice(0, 3).map(p => ({
                        id: p.permission_id,
                        name: p.name
                    }))
                );
            } else {
                console.warn('No process permissions found in the API response');
            }

            return {
                user: userPermissions,
                risk: riskPermissions,
                core: corePermissions,
                process: processPermissions
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