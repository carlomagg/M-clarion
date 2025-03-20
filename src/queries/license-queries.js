import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL, ACCESS_TOKEN_NAME } from '../utils/consts';
import { get } from 'lockr';

const apiUrl = BASE_API_URL;

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
        const response = await axios.get(`${apiUrl}/clarion_users/license-count/`, {
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
        const response = await axios.get(`${apiUrl}/clarion_users/users/${userId}/licenses/`, {
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
        const response = await axios.post(`${apiUrl}/clarion_users/users/${userId}/licenses/assign/`, licenseData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('License assignment error:', error);
        throw new Error(error.response?.data?.message || 'Failed to assign license');
    }
}

async function revokeLicense({ userId, licenseId }) {
    const token = get(ACCESS_TOKEN_NAME);
    try {
        const response = await axios.delete(`${apiUrl}/clarion_users/users/${userId}/licenses/${licenseId}/delete/`, {
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
        ...callbacks
    });
}

export function useRevokeLicense(callbacks) {
    return useMutation({
        mutationFn: revokeLicense,
        ...callbacks
    });
}
