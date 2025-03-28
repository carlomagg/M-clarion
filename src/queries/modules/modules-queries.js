import axios from 'axios';
import { BASE_API_URL, ACCESS_TOKEN_NAME, MODULES } from '../../utils/consts';
import { get } from 'lockr';

// Remove trailing slash from BASE_API_URL if it exists
const apiUrl = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;

// Create axios instance with retry logic
const axiosInstance = axios.create({
    timeout: 30000, // 30 second timeout
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
            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

export const modulesOptions = () => ({
    queryKey: ['modules', 'clarion_users'],
    queryFn: async () => {
        try {
            console.log('Fetching modules from:', `${apiUrl}/clarion_users/license-count/`);
            const response = await axiosInstance.get(`${apiUrl}/clarion_users/license-count/`);
            
            // Debug log to see raw response
            console.log('Raw modules response:', response.data);

            if (!Array.isArray(response.data)) {
                throw new Error('Invalid modules response format');
            }

            // Map the response data to match our module constants
            const mappedData = response.data.map(module => {
                let moduleId;
                if (module.module_name.toLowerCase().includes('risk')) {
                    moduleId = MODULES.RISK_MANAGEMENT.id;
                } else if (module.module_name.toLowerCase().includes('process')) {
                    moduleId = MODULES.PROCESS_MANAGEMENT.id;
                } else {
                    moduleId = parseInt(module.module_id, 10);
                }

                return {
                    ...module,
                    module_id: moduleId,
                    module_name: moduleId === MODULES.RISK_MANAGEMENT.id 
                        ? MODULES.RISK_MANAGEMENT.name 
                        : moduleId === MODULES.PROCESS_MANAGEMENT.id 
                        ? MODULES.PROCESS_MANAGEMENT.name 
                        : module.module_name,
                    license_type: Array.isArray(module.license_type) ? module.license_type.map(lt => ({
                        ...lt,
                        type_id: parseInt(lt.type_id, 10),
                        count: parseInt(lt.count, 10)
                    })) : []
                };
            });

            console.log('Mapped modules:', mappedData);
            return mappedData;
        } catch (error) {
            console.error('Modules fetch error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                code: error.code,
                url: `${apiUrl}/clarion_users/license-count/`
            });
            throw new Error(error.response?.data?.message || 'Failed to fetch modules. Please check your connection and try again.');
        }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000 // Keep in cache for 10 minutes
});

export const licenseTypesOptions = () => ({
    queryKey: ['license-types', 'clarion_users'],
    queryFn: async () => {
        try {
            console.log('Fetching license types from:', `${apiUrl}/clarion_users/license-types/`);
            const response = await axiosInstance.get(`${apiUrl}/clarion_users/license-types/`);
            
            // Debug log to see raw response
            console.log('Raw license types response:', response.data);

            if (!Array.isArray(response.data)) {
                throw new Error('Invalid license types response format');
            }

            return response.data.map(lt => ({
                ...lt,
                type_id: parseInt(lt.type_id, 10)
            }));
        } catch (error) {
            console.error('License types fetch error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                code: error.code,
                url: `${apiUrl}/clarion_users/license-types/`
            });
            throw new Error(error.response?.data?.message || 'Failed to fetch license types. Please check your connection and try again.');
        }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000 // Keep in cache for 10 minutes
});
