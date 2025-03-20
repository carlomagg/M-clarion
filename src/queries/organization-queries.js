import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

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
    let response = await axios.get(`clarion_users/${plurals[type]}/view-all`);
    return response.data[plurals[type]];
}
async function fetch({queryKey}, type) {
    const [_, id] = queryKey;
    let response = await axios.get(`clarion_users/${plurals[type]}/${id}/view`);
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
    let headers = {};
    // add multipart form-data header if type is subsidiary or company as the req data contains image file
    if (type === 'subsidiary' || 'company') headers = {'Content-Type': 'multipart/form-data'}
    let response = await axios.post(`clarion_users/${plurals[type]}/`, data, {headers});
    return response.data;
}
async function updateItem(type, {id, data}) {
    let headers = {};
    // add multipart form-data header if type is subsidiary or company as the req data contains image file
    if (type === 'subsidiary' || 'company') headers = {'Content-Type': 'multipart/form-data'}
    let response = await axios.put(`clarion_users/${plurals[type]}/${id}/update/`, data, {headers});
    return response.data;
}
async function deleteItem(type, {id}) {
    let response = await axios.delete(`clarion_users/${plurals[type]}/${id}/delete/`);
    return response.data;
}
async function suspendItem(type, {data}) {
    let response = await axios.put(`clarion_users/suspend-${plurals[type]}/`, data);
    return response.data;
}
async function activateItem(type, {data}) {
    let response = await axios.put(`clarion_users/activate-${plurals[type]}/`, data);
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
        const response = await axios.get('clarion_users/company/view');
        
        // If we get a successful response with company data
        if (response.data && response.data.company_name) {
            return {
                ...response.data,
                is_activated: true
            };
        }
        
        // No valid company data found, return not activated
        return {
            is_activated: false
        };
    } catch (error) {
        console.error('Company Info Error:', error?.response?.data || error.message);
        return {
            is_activated: false
        };
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

export const companiesOptions = () => allItemOptions('company');
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
export const divisionOptions = (branchId, options = {}) => singleItemOptions('division', branchId, options);

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