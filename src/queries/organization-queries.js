import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// Flag to track if a token refresh is in progress
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Handle token refresh
const refreshAuthToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post('/clarion_users/auth/token/refresh/', {
            refresh: refreshToken
        });

        if (!response.data?.access) {
            throw new Error('No access token in refresh response');
        }

        const newToken = response.data.access;
        localStorage.setItem('access_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
};

// Handle logout
const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Use href for immediate redirection
    window.location.href = '/login';
};

// Add axios interceptor for handling token expiration
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Prevent infinite refresh loops
        if (originalRequest?.url?.includes('auth/token/refresh')) {
            handleLogout();
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized responses
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                try {
                    // Queue requests while token is being refreshed
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return axios(originalRequest);
                } catch (err) {
                    handleLogout();
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAuthToken();
                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other error cases
        if (error.response?.status === 403) {
            console.error('Permission denied');
            // Optional: Redirect to forbidden page
            // window.location.replace('/forbidden');
        }

        return Promise.reject(error);
    }
);

let plurals = {
    'branch': 'branches',
    'subsidiary': 'subsidiaries',
    'division': 'divisions',
    'department': 'departments',
    'unit': 'units',
    'subsidiary': 'subsidiaries',
    'company': 'companies'
};

// queryFn Factories
async function fetchAll(fnContext, type) {
    try {
        let response = await axios.get(`clarion_users/${plurals[type]}/view-all`);
        return Array.isArray(response.data[plurals[type]]) ? response.data[plurals[type]] : [];
    } catch (error) {
        console.error(`Error fetching ${type}:`, error?.response?.data || error.message);
        return [];
    }
}
async function fetch({queryKey}, type) {
    const [_, id] = queryKey;
    // Special handling for company views
    if (type === 'company') {
        let response = await axios.get(`clarion_users/company/view`);
        return response.data;
    }
    // Standard handling for other entity types
    let response = await axios.get(`clarion_users/${plurals[type]}/${id}/view/`);
    return response.data;
}

// queryOptions Factories
function allItemOptions(type, options) {
    return queryOptions({
        queryKey: [plurals[type]],
        queryFn: (fnContext) => fetchAll(fnContext, type),
        ...options
    });
}

function singleItemOptions(type, id, options) {
    return queryOptions({
        queryKey: [plurals[type], id],
        queryFn: (fnContext) => fetch(fnContext, type),
        ...options
    });
}

// mutationFn Factories
async function addItem(type, {data}) {
    try {
        let headers = {};
        // add multipart form-data header if type is subsidiary or company as the req data contains image file
        if (type === 'subsidiary' || type === 'company') headers = {'Content-Type': 'multipart/form-data'}
        
        console.log('Adding item:', {
            type,
            endpoint: `/clarion_users/${plurals[type]}/`,
            headers,
            data: data instanceof FormData ? Object.fromEntries(data.entries()) : data
        });

        let response = await axios.post(`/clarion_users/${plurals[type]}/`, data, {headers});
        console.log('Add item response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Add item error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}
async function updateItem(type, {id, data}) {
    let headers = {};
    // add multipart form-data header if type is subsidiary or company as the req data contains image file
    if (type === 'subsidiary' || type === 'company') headers = {'Content-Type': 'multipart/form-data'}
    let response = await axios.put(`/clarion_users/${plurals[type]}/${id}/update/`, data, {headers});
    return response.data;
}
async function deleteItem(type, {id}) {
    let response = await axios.delete(`/clarion_users/${plurals[type]}/${id}/delete/`);
    return response.data;
}
async function suspendItem(type, {data}) {
    let response = await axios.put(`/clarion_users/suspend-${plurals[type]}/`, data);
    return response.data;
}
async function activateItem(type, {data}) {
    // Use specific endpoint for company activation
    if (type === 'company') {
        let response = await axios.put('/clarion_users/company/activate/', data);
        return response.data;
    }
    // Use generic endpoint for other types
    let response = await axios.put(`/clarion_users/activate-${plurals[type]}/`, data);
    return response.data;
}

// mutation hooks Factories
function useAddItem(type, callbacks) {
    return useMutation({
        mutationFn: (variables) => addItem(type, variables),
        ...callbacks
    })
}
function useUpdateItem(type, callbacks) {
    return useMutation({
        mutationFn: (variables) => updateItem(type, variables),
        ...callbacks
    })
}
function useDeleteItem(type, callbacks) {
    return useMutation({
        mutationFn: (variables) => deleteItem(type, variables),
        ...callbacks
    })
}
function useSuspendItem(type, callbacks) {
    return useMutation({
        mutationFn: (variables) => suspendItem(type, variables),
        ...callbacks
    })
}
function useActivateItem(type, callbacks) {
    return useMutation({
        mutationFn: (variables) => activateItem(type, variables),
        ...callbacks
    })
}


// COMPANIES
// query functions
async function fetchCompanyInfo() {
    try {
        const response = await axios.get('clarion_users/company/view/');
        console.log('Raw company info API response:', response.data);
        
        // Check if company exists and is activated
        if (response.data && !response.data.license_not_activated) {
            // Ensure permissions and licenses are always defined to prevent null checks
            const processedData = {
                ...response.data,
                licenses: response.data.licenses || [],
                permissions: response.data.permissions || {},
                hasPermission: (permission) => response.data.permissions?.[permission] || false
            };
            console.log('Processed company data:', processedData);
            return processedData;
        }
        throw new Error('Company license not activated');
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('Authentication failed. Please log in again.');
            // You might want to redirect to login page or refresh token here
            throw new Error('Authentication required');
        }
        if (error.response?.status === 400) {
            console.error('Invalid request or token refresh failed:', error.response.data);
            throw new Error('Invalid request or session expired');
        }
        console.error('Company Info Error:', error?.response?.data || error.message);
        // Return a safe default object to prevent null permission checks
        return {
            licenses: [],
            permissions: {},
            hasPermission: () => false
        };
    }
}

async function fetchCompanies() {
    try {
        const response = await axios.get('clarion_users/company/view');
        // Since the API returns a single company, we'll wrap it in an array
        return [response.data];
    } catch (error) {
        console.error('Companies Error:', error?.response?.data || error.message);
        throw error;
    }
}

// query options
export function companyInfoOptions() {
    return queryOptions({
        queryKey: ['company_info'],
        queryFn: fetchCompanyInfo,
        retry: 0
    });
}

export const companiesOptions = () => queryOptions({
    queryKey: ['companies'],
    queryFn: fetchCompanies
});

export const companyOptions = (companyId, options = {}) => singleItemOptions('company', companyId, options);

// mutation hooks
export const useAddCompany = (callbacks = {}) => useAddItem('company', callbacks);
export const useUpdateCompany = (callbacks = {}) => useUpdateItem('company', callbacks);
export const useDeleteCompany = (callbacks = {}) => useDeleteItem('company', callbacks);
export const useSuspendCompany = (callbacks = {}) => useSuspendItem('company', callbacks);
export const useActivateCompany = (callbacks = {}) => useActivateItem('company', callbacks);


// SUBSIDIARIES
// query options
export const subsidiariesOptions = (options) => allItemOptions('subsidiary', options);
export const subsidiaryOptions = (subsidiaryId, options = {}) => singleItemOptions('subsidiary', subsidiaryId, options);

// mutation hooks
export const useAddSubsidiary = (callbacks = {}) => useAddItem('subsidiary', callbacks);
export const useUpdateSubsidiary = (callbacks = {}) => useUpdateItem('subsidiary', callbacks);
export const useDeleteSubsidiary = (callbacks = {}) => useDeleteItem('subsidiary', callbacks);
export const useSuspendSubsidiary = (callbacks = {}) => useSuspendItem('subsidiary', callbacks);
export const useActivateSubsidiary = (callbacks = {}) => useActivateItem('subsidiary', callbacks);


// BRANCHES
// query options
export const branchesOptions = () => allItemOptions('branch');
export const branchOptions = (branchId, options = {}) => singleItemOptions('branch', branchId, options);

// mutation hooks
export const useAddBranch = (callbacks = {}) => useAddItem('branch', callbacks);
export const useUpdateBranch = (callbacks = {}) => useUpdateItem('branch', callbacks);
export const useDeleteBranch = (callbacks = {}) => useDeleteItem('branch', callbacks);
export const useSuspendBranch = (callbacks = {}) => useSuspendItem('branch', callbacks);
export const useActivateBranch = (callbacks = {}) => useActivateItem('branch', callbacks);


// DIVISIONS
// query options
export const divisionsOptions = () => allItemOptions('division');
export const divisionOptions = (divisionId, options = {}) => singleItemOptions('division', divisionId, options);

// mutation hooks
export const useAddDivision = (callbacks = {}) => useAddItem('division', callbacks);
export const useUpdateDivision = (callbacks = {}) => useUpdateItem('division', callbacks);
export const useDeleteDivision = (callbacks = {}) => useDeleteItem('division', callbacks);
export const useSuspendDivision = (callbacks = {}) => useSuspendItem('division', callbacks);
export const useActivateDivision = (callbacks = {}) => useActivateItem('division', callbacks);


// DEPARTMENTS
// query options
export const departmentsOptions = () => allItemOptions('department');
export const departmentOptions = (branchId, options = {}) => singleItemOptions('department', branchId, options);

// mutation hooks
export const useAddDepartment = (callbacks = {}) => useAddItem('department', callbacks);
export const useUpdateDepartment = (callbacks = {}) => useUpdateItem('department', callbacks);
export const useDeleteDepartment = (callbacks = {}) => useDeleteItem('department', callbacks);
export const useSuspendDepartment = (callbacks = {}) => useSuspendItem('department', callbacks);
export const useActivateDepartment = (callbacks = {}) => useActivateItem('department', callbacks);


// UNITS
// query options
export const unitsOptions = () => allItemOptions('unit');
export const unitOptions = (branchId, options = {}) => singleItemOptions('unit', branchId, options);

// mutation hooks
export const useAddUnit = (callbacks = {}) => useAddItem('unit', callbacks);
export const useUpdateUnit = (callbacks = {}) => useUpdateItem('unit', callbacks);
export const useDeleteUnit = (callbacks = {}) => useDeleteItem('unit', callbacks);
export const useSuspendUnit = (callbacks = {}) => useSuspendItem('unit', callbacks);
export const useActivateUnit = (callbacks = {}) => useActivateItem('unit', callbacks);


// INDUSTRIES
// query function
async function getAllIndustries() {
    let response = await axios.get('clarion_users/industries');
    return response.data['data'];
}

// query options
export function industriesOptions() {
    return queryOptions({
        queryKey: ['industries'],
        queryFn: getAllIndustries
    });
}

// LICENSE ACTIVATION
// query function
async function checkLicenseStatus() {
    let response = await axios.get('clarion_users/companies/license/status');
    return response.data;
}

async function activateLicense({serialNumber}) {
    let response = await axios.post('clarion_users/companies/license/activate', { serial_number: serialNumber });
    return response.data;
}

// query options
export function licenseStatusOptions() {
    return queryOptions({
        queryKey: ['license_status'],
        queryFn: checkLicenseStatus
    });
}

// mutation hooks
export function useActivateLicense(callbacks = {}) {
    return useMutation({
        mutationFn: activateLicense,
        ...callbacks
    });
}