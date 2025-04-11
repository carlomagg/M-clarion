export const BASE_API_URL = import.meta.env.VITE_API_URL
export const ACCESS_TOKEN_NAME = import.meta.env.VITE_ACCESS_TOKEN_NAME;
export const REFRESH_TOKEN_NAME = import.meta.env.VITE_REFRESH_TOKEN_NAME;
export const SECRET_KEY = import.meta.env.VITE_PERMISSIONS_DECRYPTION_KEY;
export const USER_DATA_CACHE_KEY = 'mc_user_data_cache';

// Module IDs
export const MODULES = {
    RISK_MANAGEMENT: {
        id: 2,
        name: 'Risk Management',
        key: 'risk'
    },
    PROCESS_MANAGEMENT: {
        id: 3,
        name: 'Process Management',
        key: 'process'
    }
};