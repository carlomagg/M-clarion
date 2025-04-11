import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";
import auth from '../utils/auth';
import { get } from "lockr";
import { ACCESS_TOKEN_NAME } from "../utils/consts";

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
        console.log('Updating user profile with data:', JSON.stringify(formData, null, 2));
        
        // Get current user data to preserve existing values
        const currentUserResponse = await axios.get(`clarion_users/users/${userId}/`);
        const currentUserData = currentUserResponse.data;
        
        // Format the licenses correctly from the API response
        const existingLicenses = Array.isArray(currentUserData.user_licenses) 
            ? currentUserData.user_licenses.map(license => {
                // Convert module_id from string to number if needed
                const moduleId = license.module_id === 'risk' ? 1 : 
                               license.module_id === 'processes' ? 2 : 
                               parseInt(license.module_id, 10);
                
                // Convert license_type_id from string to number if needed
                const licenseTypeId = license.license_type_id === 'Named User' ? 1 :
                                    license.license_type_id === 'Read-only' ? 2 :
                                    parseInt(license.license_type_id, 10);

                return {
                    module_id: moduleId,
                    license_type_id: licenseTypeId
                };
            })
            : [];

        console.log('Formatted existing licenses:', existingLicenses);

        // Create payload with correct field mappings
        const payload = {
            user_details: {
                first_name: formData.user_details.first_name?.trim() || currentUserData.firstname,
                last_name: formData.user_details.last_name?.trim() || currentUserData.lastname,
                email_address: formData.user_details.email_address || currentUserData.email,
                subsidiary_id: formData.user_details.subsidiary_id || currentUserData.subsidiary_id,
                supervisor_id: formData.user_details.supervisor_id || currentUserData.supervisor,
                user_source_id: formData.user_details.user_source_id || currentUserData.user_source_id,
                require_password_change: formData.user_details.require_password_change ?? currentUserData.require_password_change
            },
            // Use the properly formatted licenses array
            user_licenses: existingLicenses,
            user_permissions: {
                set_as_admin: formData.user_permissions?.set_as_admin ?? currentUserData.is_admin ?? false,
                permission_ids: formData.user_permissions?.permission_ids || 
                    (currentUserData.permissions?.map(p => parseInt(p.permission_id || p.id, 10)) || [])
            }
        };

        console.log('Update payload:', JSON.stringify(payload, null, 2));
        
        const endpoint = isQueueUser 
            ? `clarion_users/queue/users/${userId}/update/`
            : `clarion_users/users/${userId}/update/`;
            
        const response = await axios.put(endpoint, payload);
        console.log('Update response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
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

// Remove permissions from a user
export const removeUserPermissions = async ({ userId, permissionIds }) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
        const response = await axios.delete(
            `clarion_users/users/${userId}/permissions/remove/`,
            {
                data: {
                    permission_ids: permissionIds
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error removing permissions:', error);
        throw new Error(error.response?.data?.message || 'Failed to remove permissions');
    }
};

// Hook for removing user permissions
export const useRemoveUserPermissions = (options = {}) => {
    return useMutation({
        mutationFn: removeUserPermissions,
        ...options
    });
};

// User dashboard queries
export function userCountOptions() {
    return {
        queryKey: ['userCount'],
        queryFn: async () => {
            try {
                console.log('Fetching user count...');
                const response = await axios.get('clarion_users/user_count/');
                console.log('User count response:', response.data);
                
                // Log the structure of the response
                console.log('User count structure:', {
                    total_users: response.data.total_users,
                    user_counts: response.data.user_counts,
                    raw_response: response.data
                });
                
                // If the API doesn't provide the counts in the expected format, calculate them from the users list
                if (!response.data.user_counts || 
                    (response.data.user_counts.Active === undefined && response.data.user_counts.active === undefined) ||
                    (response.data.user_counts.Suspended === undefined && response.data.user_counts.suspended === undefined)) {
                    
                    console.log('User counts not provided in expected format, fetching users to calculate counts');
                    const usersResponse = await axios.get('clarion_users/all-users/');
                    const users = usersResponse.data;
                    
                    // Calculate counts from the users list
                    const activeCount = users.filter(user => !user.is_suspended).length;
                    const suspendedCount = users.filter(user => user.is_suspended).length;
                    const adminCount = users.filter(user => user.is_admin).length;
                    
                    // Return the calculated counts
                    return {
                        total_users: users.length,
                        user_counts: {
                            Active: activeCount,
                            Suspended: suspendedCount,
                            Admin: adminCount
                        }
                    };
                }
                
                // Return the data directly from the API response
                return response.data;
            } catch (error) {
                console.error('fetchUserCount error:', error.message || error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    console.error('Error status:', error.response.status);
                    console.error('Error headers:', error.response.headers);
                }
                throw error;
            }
        }
    };
}

export async function fetchOnlineUsers() {
    try {
        console.log('Fetching online users...');
        const response = await axios.get('clarion_users/online-users/');
        console.log('Online users raw response:', response);
        
        // Extract data from nested response structure
        const onlineUsers = response.data?.data || [];
        console.log('Online users array:', onlineUsers);
        
        // Log each online user's email for debugging
        onlineUsers.forEach(user => {
            console.log('Online user email:', user.email);
        });

        // Return in the format React Query expects
        return { data: onlineUsers };
    } catch (error) {
        console.error('fetchOnlineUsers error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

export function onlineUsersOptions(options) {
    return {
        queryKey: ['onlineUsers'],
        queryFn: fetchOnlineUsers,
        refetchInterval: 10000, // Refetch every 10 seconds
        staleTime: 5000, // Consider data stale after 5 seconds
        retry: false,
        ...options
    };
}

export async function forceLogoutUser({ user_id }) {
    try {
        console.log('Force logging out user:', user_id);
        const response = await axios.put(`clarion_users/force-logout-user/`, { 
            user_id: user_id 
        });
        console.log('Force logout response:', response.data);
        return response.data;
    } catch (error) {
        console.error('forceLogoutUser error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

export function useForceLogoutUser(callbacks) {
    return useMutation({
        mutationFn: forceLogoutUser,
        ...callbacks
    })
}
