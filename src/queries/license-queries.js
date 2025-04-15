import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { get } from 'lockr';
import { ACCESS_TOKEN_NAME } from '../utils/consts';

/**
 * @typedef {Object} LicenseType
 * @property {string} type - The type of license
 * @property {number} type_id - The ID of the license type
 * @property {string} usage - The usage count in format "used/total"
 */

/**
 * @typedef {Object} ModuleLicense
 * @property {string} module_name - The name of the module
 * @property {number} module_id - The ID of the module
 * @property {number} total_licenses - Total number of licenses
 * @property {string} license_usage - The usage count in format "used/total"
 * @property {LicenseType[]} license_type - Array of license types and their usage
 */

/**
 * Fetches license count information for all modules
 * @returns {Promise<ModuleLicense[]>} Array of module licenses with their usage
 */
async function fetchLicenses() {
    const token = get(ACCESS_TOKEN_NAME);
    try {
        const response = await axios.get('clarion_users/license-count/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Validate response format
        if (!Array.isArray(response.data)) {
            throw new Error('Invalid response format: expected an array');
        }

        // Validate each module license object
        const validatedData = response.data.map(module => {
            if (!module.module_name || typeof module.module_id !== 'number' || 
                !Array.isArray(module.license_type)) {
                console.warn('Invalid module license format:', module);
            }
            return module;
        });

        return validatedData;
    } catch (error) {
        console.error('Licenses fetch error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch licenses');
    }
}

async function fetchUserLicenses(userId) {
    const token = get(ACCESS_TOKEN_NAME);
    try {
        const response = await axios.get(`clarion_users/users/${userId}/licenses/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('User licenses fetch error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch user licenses');
    }
}

// Mutation functions
async function assignLicense({ userId, licenseData }) {
    const token = get(ACCESS_TOKEN_NAME);
    try {
        // First, get the user's current permissions
        const currentUserResponse = await axios.get(`clarion_users/users/${userId}/permissions/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const currentPermissions = currentUserResponse.data.permission_ids || [];
        
        // Use the update endpoint
        const url = `clarion_users/users/${userId}/update/`;
        console.log('Updating license with URL:', url);
        console.log('License data:', licenseData);
        
        // Format the data according to the update endpoint requirements
        const updateData = {
            user_details: {},  // Keep existing user details
            user_licenses: [{
                module_id: parseInt(licenseData.module_id, 10),
                license_type_id: parseInt(licenseData.license_type_id, 10)
            }],
            user_permissions: {
                permission_ids: currentPermissions,  // Preserve existing permissions
                set_as_admin: false
            }
        };
        
        const response = await axios.put(url, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('License update response:', response.data);
        return response.data;
    } catch (error) {
        console.error('License assignment error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw new Error(error.response?.data?.message || 'Failed to assign license');
    }
}

async function revokeLicense({ userId, licenseId }) {
    const token = get(ACCESS_TOKEN_NAME);
    try {
        const response = await axios.delete(`clarion_users/users/${userId}/licenses/${licenseId}/delete`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('License revocation error:', error);
        throw new Error(error.response?.data?.message || 'Failed to revoke license');
    }
}

// Query options
export function licensesOptions() {
    return queryOptions({
        queryKey: ['licenses'],
        queryFn: fetchLicenses
    });
}

export function userLicensesOptions(userId) {
    return queryOptions({
        queryKey: ['licenses', userId],
        queryFn: () => fetchUserLicenses(userId)
    });
}

// Mutation hooks
export function useAssignLicense(callbacks) {
    return useMutation({
        mutationFn: assignLicense,
        onSuccess: (data) => {
            console.log('License assignment successful:', data);
            if (callbacks?.onSuccess) {
                callbacks.onSuccess(data);
            }
        },
        onError: (error) => {
            console.error('License assignment error in hook:', error);
            if (callbacks?.onError) {
                callbacks.onError(error);
            }
        }
    });
}

export function useRevokeLicense(callbacks) {
    return useMutation({
        mutationFn: revokeLicense,
        ...callbacks
    });
}
