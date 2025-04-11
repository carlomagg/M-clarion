import axios from 'axios';
import { MODULES } from '../../utils/consts';

export const modulesOptions = () => ({
    queryKey: ['modules', 'clarion_users'],
    queryFn: async () => {
        try {
            console.log('Fetching modules from: clarion_users/license-count/');
            const response = await axios.get('clarion_users/license-count/');
            
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
                url: 'clarion_users/license-count/'
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
            console.log('Fetching license types from: clarion_users/license-types/');
            const response = await axios.get('clarion_users/license-types/');
            
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
                url: 'clarion_users/license-types/'
            });
            throw new Error(error.response?.data?.message || 'Failed to fetch license types. Please check your connection and try again.');
        }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000 // Keep in cache for 10 minutes
});
