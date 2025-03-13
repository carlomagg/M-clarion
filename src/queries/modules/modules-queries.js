import axios from 'axios';
import { BASE_API_URL, ACCESS_TOKEN_NAME, MODULES } from '../../utils/consts';
import { get } from 'lockr';

// Remove trailing slash from BASE_API_URL if it exists
const apiUrl = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;

export const modulesOptions = () => ({
    queryKey: ['modules', 'clarion_users'],
    queryFn: async () => {
        const token = get(ACCESS_TOKEN_NAME);
        try {
            const response = await axios.get(`${apiUrl}/clarion_users/license-count/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Map the response data to match our module constants
            const mappedData = response.data.map(module => {
                let moduleId;
                if (module.module_name.toLowerCase().includes('risk')) {
                    moduleId = MODULES.RISK_MANAGEMENT.id;
                } else if (module.module_name.toLowerCase().includes('process')) {
                    moduleId = MODULES.PROCESS_MANAGEMENT.id;
                } else {
                    moduleId = module.module_id;
                }

                return {
                    ...module,
                    module_id: moduleId,
                    module_name: moduleId === MODULES.RISK_MANAGEMENT.id 
                        ? MODULES.RISK_MANAGEMENT.name 
                        : moduleId === MODULES.PROCESS_MANAGEMENT.id 
                        ? MODULES.PROCESS_MANAGEMENT.name 
                        : module.module_name
                };
            });

            console.log('Mapped modules:', mappedData);
            return mappedData;
        } catch (error) {
            console.error('Modules fetch error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch modules');
        }
    },
});

export const licenseTypesOptions = () => ({
    queryKey: ['license-types', 'clarion_users'],
    queryFn: async () => {
        const token = get(ACCESS_TOKEN_NAME);
        try {
            const response = await axios.get(`${apiUrl}/clarion_users/license-types/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('License types fetch error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch license types');
        }
    },
});
