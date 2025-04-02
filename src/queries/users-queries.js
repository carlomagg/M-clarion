import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";
import auth from '../utils/auth';

// query functions
export async function fetchUsers() {
    try {
        console.log('Fetching users...');
        const response = await axios.get('clarion_users/all-users/');
        console.log('Users response:', response.data);
        return response.data;
    } catch (error) {
        console.error('fetchUsers error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

export const fetchUser = async ({ queryKey }) => {
    try {
        const [_, userId] = queryKey;
        console.log('Fetching user...', userId);
        const response = await axios.get(`clarion_users/users/${userId}/`);
        console.log('User response:', response.data);
        
        // Ensure licenses are properly formatted
        const userData = {
            ...response.data,
            licenses: Array.isArray(response.data.licenses) 
                ? response.data.licenses.map(license => ({
                    module_id: parseInt(license.module_id, 10),
                    license_type_id: parseInt(license.license_type_id, 10)
                }))
                : Array.isArray(response.data.user_licenses)
                    ? response.data.user_licenses.map(license => ({
                        module_id: parseInt(license.module_id, 10),
                        license_type_id: parseInt(license.license_type_id, 10)
                    }))
                    : Array.isArray(response.data.user_license)
                        ? response.data.user_license.map(license => ({
                            module_id: parseInt(license.module_id, 10),
                            license_type_id: parseInt(license.license_type_id, 10)
                        }))
                        : []
        };
        
        console.log('Processed user data with licenses:', userData);
        return userData;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export async function fetchSubsidiaries() {
    try {
        console.log('Fetching subsidiaries...');
        const response = await axios.get('clarion_users/subsidiaries/view-all/');
        console.log('Subsidiaries response:', response.data);
        return response.data;
    } catch (error) {
        console.error('fetchSubsidiaries error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

export async function fetchSupervisors() {
    try {
        console.log('Fetching supervisors...');
        const response = await axios.get('clarion_users/all-users/');
        console.log('Supervisors response:', response.data);
        return response.data;
    } catch (error) {
        console.error('fetchSupervisors error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

// mutation functions
async function addUser({formData}) {
    try {
        console.log('User registration - Raw formData:', JSON.stringify(formData, null, 2));
        
        // Ensure required fields and data types match API requirements
        const payload = {
            user_details: {
                first_name: formData.user_details.first_name?.trim(),
                last_name: formData.user_details.last_name?.trim(),
                email_address: formData.user_details.email_address?.trim(),
                password: formData.user_details.password?.trim(),
                supervisor_id: formData.user_details.supervisor_id ? String(formData.user_details.supervisor_id) : '',
                subsidiary_id: formData.user_details.subsidiary_id ? parseInt(formData.user_details.subsidiary_id, 10) : null,
                require_password_change: Boolean(formData.user_details.require_password_change),
                send_login_details: true,
                automatically_create_password: false,
                user_source_id: parseInt(formData.user_details.source_id || formData.user_details.user_source_id, 10)
            },
            user_licenses: Array.isArray(formData.user_licenses) ? formData.user_licenses : [],
            user_permissions: {
                set_as_admin: Boolean(formData.user_permissions?.set_as_admin),
                permission_ids: Array.isArray(formData.user_permissions?.permission_ids) ? 
                    formData.user_permissions.permission_ids : []
            }
        };

        console.log('User registration - Formatted payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(`clarion_users/register/`, payload);
        console.log('User registration - Success response:', response.data);
        return response.data;
    } catch (error) {
        console.error('addUser error:', error.message || error);
        if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            console.error('Original request data:', error.config?.data);
        }
        throw error;
    }
}

async function addUsers({formData}) {
    try {
        console.log('Multiple users registration - Raw formData:', JSON.stringify(formData, null, 2));
        
        // Send the data in the expected format
        const response = await axios.post(`clarion_users/register/multi/`, formData);
        console.log('Multiple users registration - Success response:', response.data);
        return response.data;
    } catch (error) {
        console.error('addUsers error:', error.message || error);
        if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            console.error('Original request data:', error.config?.data);
        }
        throw error;
    }
}

async function updateUserProfile({userId, formData, isQueueUser}) {
    try {
        console.log('Updating user profile - Raw formData:', JSON.stringify(formData, null, 2));
        console.log('Is queue user:', isQueueUser);
        console.log('User ID:', userId);
        
        // Helper function to safely parse integers
        const safeParseInt = (value) => {
            if (value === null || value === undefined || value === '') return null;
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? null : parsed;
        };

        // Helper function to safely handle supervisor_id
        const formatSupervisorId = (value) => {
            if (!value || value === '') return null; // Return null for empty values
            const strValue = String(value).replace(/^sup_/, ''); // Remove 'sup_' prefix if present
            return strValue || null; // Return null if empty string after processing
        };

        // Fetch current user data if licenses or permissions are not provided
        let currentUserData = null;
        if (!formData.user_licenses?.length || !formData.user_permissions?.permission_ids?.length) {
            try {
                console.log('Fetching current user data for ID:', userId);
                const response = await axios.get(`clarion_users/users/${userId}/`);
                currentUserData = response.data;
                console.log('Current user data:', JSON.stringify(currentUserData, null, 2));
                
                // If licenses are not provided, use current licenses
                if (!formData.user_licenses?.length) {
                    console.log('No licenses provided, using current licenses');
                    // Handle all possible license formats
                    formData.user_licenses = Array.isArray(currentUserData.licenses) 
                        ? currentUserData.licenses.map(license => ({
                            module_id: parseInt(license.module_id, 10),
                            license_type_id: parseInt(license.license_type_id, 10)
                        }))
                        : Array.isArray(currentUserData.user_licenses)
                            ? currentUserData.user_licenses.map(license => ({
                                module_id: parseInt(license.module_id, 10),
                                license_type_id: parseInt(license.license_type_id, 10)
                            }))
                            : Array.isArray(currentUserData.user_license)
                                ? currentUserData.user_license.map(license => ({
                                    module_id: parseInt(license.module_id, 10),
                                    license_type_id: parseInt(license.license_type_id, 10)
                                }))
                                : [];
                    console.log('Updated licenses:', JSON.stringify(formData.user_licenses, null, 2));
                }
                
                // If permissions are not provided, use current permissions
                if (!formData.user_permissions?.permission_ids?.length) {
                    console.log('No permissions provided, using current permissions');
                    // Handle both array and object formats
                    formData.user_permissions = {
                        set_as_admin: currentUserData.is_admin || false,
                        permission_ids: Array.isArray(currentUserData.permission_ids) 
                            ? currentUserData.permission_ids
                            : Array.isArray(currentUserData.permissions)
                                ? currentUserData.permissions.map(perm => perm.permission_id)
                                : []
                    };
                    console.log('Updated permissions:', JSON.stringify(formData.user_permissions, null, 2));
                }
            } catch (error) {
                console.error('Failed to fetch current user data:', error);
                console.error('Error details:', error.response?.data);
                // Use empty arrays if fetch fails
                formData.user_licenses = formData.user_licenses || [];
                formData.user_permissions = formData.user_permissions || { permission_ids: [] };
            }
        }
        
        // Ensure required fields and data types match API requirements
        const payload = {
            user_details: {
                first_name: formData.user_details.first_name?.trim(),
                last_name: formData.user_details.last_name?.trim(),
                email_address: formData.user_details.email_address?.trim(),
                supervisor_id: formatSupervisorId(formData.user_details.supervisor_id),
                subsidiary_id: safeParseInt(formData.user_details.subsidiary_id),
                require_password_change: Boolean(formData.user_details.require_password_change),
                send_login_details: true,
                automatically_create_password: false,
                user_source_id: safeParseInt(formData.user_details.source_id || formData.user_details.user_source_id)
            },
            user_licenses: Array.isArray(formData.user_licenses) ? formData.user_licenses.map(license => ({
                module_id: safeParseInt(license.module_id),
                license_type_id: safeParseInt(license.license_type_id)
            })).filter(license => license.module_id && license.license_type_id) : [],
            user_permissions: {
                set_as_admin: Boolean(formData.user_permissions?.set_as_admin),
                permission_ids: Array.isArray(formData.user_permissions?.permission_ids) ? 
                    formData.user_permissions.permission_ids
                        .map(id => safeParseInt(id))
                        .filter(id => id !== null) : []
            }
        };

        console.log('Formatted payload:', JSON.stringify(payload, null, 2));

        // Only include password if it's provided
        if (formData.user_details.password?.trim()) {
            payload.user_details.password = formData.user_details.password.trim();
        }
        
        let endpoint;
        let finalPayload;
        let method;
        if (isQueueUser) {
            // For queue users, use the multi-register endpoint
            endpoint = 'clarion_users/register/multi/';
            method = 'post';
            finalPayload = {
                users: [{
                    firstname: payload.user_details.first_name,
                    lastname: payload.user_details.last_name,
                    email: payload.user_details.email_address,
                    supervisor_id: formatSupervisorId(payload.user_details.supervisor_id),
                    subsidiary_id: payload.user_details.subsidiary_id || null,
                    require_password_change: true,
                    user_source_id: payload.user_details.user_source_id,
                    send_login_details: true,
                    automatically_create_password: false,
                    licenses: payload.user_licenses.map(license => ({
                        module_id: license.module_id,
                        license_type_id: license.license_type_id
                    })),
                    permissions: payload.user_permissions.permission_ids,
                    is_admin: payload.user_permissions.set_as_admin
                }],
                update_if_exists: true
            };
        } else {
            // For regular updates, use the update endpoint
            endpoint = `clarion_users/users/${userId}/update/`;
            method = 'put';
            finalPayload = {
                user_details: {
                    ...payload.user_details,
                    user_id: safeParseInt(userId)
                },
                user_licenses: payload.user_licenses,
                user_permissions: payload.user_permissions
            };

            // Remove any null values from user_details
            Object.keys(finalPayload.user_details).forEach(key => {
                if (finalPayload.user_details[key] === null && key !== 'supervisor_id') {
                    delete finalPayload.user_details[key];
                }
            });
        }
        
        console.log(`Using ${method.toUpperCase()} request to endpoint:`, endpoint);
        console.log('Final payload:', JSON.stringify(finalPayload, null, 2));
        
        const response = await axios[method](endpoint, finalPayload);
        console.log('User update - Success response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('updateUserProfile error:', error.message || error);
        if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            console.error('Original request data:', error.config?.data);
        }
        throw error;
    }
}

async function updateUserPermissions({userId, formData}) {
    try {
        const response = await axios.put(`clarion_users/users/${userId}/permissions/update/`, formData);
        return response.data;
    } catch (error) {
        console.error('updateUserPermissions error:', error.message || error);
        throw error;
    }
}

async function suspendAccounts({user_ids}) {
    try {
        const response = await axios.put(`clarion_users/suspend-accounts/`, {user_ids});
        return response.data;
    } catch (error) {
        console.error('suspendAccounts error:', error.message || error);
        throw error;
    }
}

async function activateAccounts({user_ids}) {
    try {
        const response = await axios.put(`clarion_users/activate-accounts/`, {user_ids});
        return response.data;
    } catch (error) {
        console.error('activateAccounts error:', error.message || error);
        throw error;
    }
}

async function deleteAccount({userId}) {
    try {
        const response = await axios.delete(`clarion_users/users/${userId}/delete/`);
        return response.data;
    } catch (error) {
        console.error('deleteAccount error:', error.message || error);
        throw error;
    }
}

async function updatePreferences({data}) {
    try {
        console.log('Attempting to update preferences with data:', data);
        console.log('Using API URL:', axios.defaults.baseURL);
        
        // Send all fields in the PUT request
        const response = await axios.put(`clarion_users/update-preferences/`, {
            first_name: data.first_name,
            last_name: data.last_name,
            old_password: data.old_password,
            new_password: data.new_password,
            confirm_new_password: data.confirm_new_password
        });
        return response.data;
    } catch (error) {
        console.error('updatePreferences error details:', {
            message: error.message,
            code: error.code,
            config: error.config ? {
                url: error.config.url,
                baseURL: error.config.baseURL,
                method: error.config.method,
                data: error.config.data
            } : 'No config available'
        });
        
        if (error.response) {
            console.error('Server responded with error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('Request was made but no response received');
        }
        
        throw error;
    }
}

async function changePassword({data}) {
    try {
        // Send exactly what works in Postman
        const payload = {
            email: data.email,
            new_password: data.new_password,
            confirm_new_password: data.confirm_new_password
        };
        console.log('Password change payload:', payload);
        const response = await axios.post('clarion_users/change_forgot_password/', payload);
        return response.data;
    } catch (error) {
        console.error('changePassword error:', error.message || error);
        throw error;
    }
}

import { get } from "lockr";
import { ACCESS_TOKEN_NAME } from "../utils/consts";

export const fetchNonLicensedUsers = async () => {
  try {
    const accessToken = get(ACCESS_TOKEN_NAME);
    const response = await axios.get('clarion_users/non-licensed-users/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Access Token:', accessToken); // Log the access token
    console.log('Non-licensed users response:', response.data);
    return response.data.data; // Extract the data array from the response
  } catch (error) {
    console.error('fetchNonLicensedUsers error:', error.message || error);
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    throw error;
  }
};

// query options
export function usersOptions(options) {
    return queryOptions({
        queryKey: ['users'],
        queryFn: fetchUsers,
        retry: false,
        ...options
    })
}

export function userOptions(userId) {
    return {
        queryKey: ['user', userId],
        queryFn: () => fetchUser({ queryKey: ['user', userId] }),
        enabled: !!userId,
        staleTime: 0,
        cacheTime: 0
    };
}

export function subsidiariesOptions(options) {
    return queryOptions({
        queryKey: ['subsidiaries'],
        queryFn: fetchSubsidiaries,
        retry: false,
        ...options
    })
}

export function supervisorsOptions(options) {
    return queryOptions({
        queryKey: ['supervisors'],
        queryFn: fetchSupervisors,
        retry: false,
        ...options
    })
}

// mutation options
export function useUpdateUserProfile(callbacks) {
    return useMutation({
        mutationFn: updateUserProfile,
        ...callbacks
    })
}

export function useUpdaterUserPermissions(callbacks) {
    return useMutation({
        mutationFn: updateUserPermissions,
        ...callbacks
    })
}

export function useAddUser(callbacks) {
    return useMutation({
        mutationFn: addUser,
        ...callbacks
    })
}

export function useAddUsers(callbacks) {
    return useMutation({
        mutationFn: addUsers,
        ...callbacks
    })
}

export function useSuspendAccounts(callbacks) {
    return useMutation({
        mutationFn: suspendAccounts,
        ...callbacks
    })
}

export function useActivateAccounts(callbacks) {
    return useMutation({
        mutationFn: activateAccounts,
        ...callbacks
    })
}

export function useDeleteAccount(callbacks) {
    return useMutation({
        mutationFn: deleteAccount,
        ...callbacks
    })
}

export function useUpdatePreferences(callbacks) {
    return useMutation({
        mutationFn: updatePreferences,
        ...callbacks
    })
}

export function useChangePassword(callbacks) {
    return useMutation({
        mutationFn: changePassword,
        ...callbacks
    })
}

// query functions
export async function fetchUserSources() {
    const response = await axios.get('clarion_users/user-source/');
    return response.data.sources;
}

export function userSourcesOptions() {
    return {
        queryKey: ['user-sources'],
        queryFn: fetchUserSources
    }
}
