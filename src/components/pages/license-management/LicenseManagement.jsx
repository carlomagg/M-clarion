import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersOptions, fetchNonLicensedUsers, useRemoveUserPermissions } from '../../../queries/users-queries';
import { permissionsOptions } from '../../../queries/permissions-queries';
import { modulesOptions } from '../../../queries/modules/modules-queries';
import { useAssignLicense } from '../../../queries/license-queries';
import { get } from 'lockr';
import { ACCESS_TOKEN_NAME, MODULES } from '../../../utils/consts';
import { IoIosArrowDown } from 'react-icons/io';
import axios from 'axios';

// Don't use BASE_API_URL directly, it's already included in the axios instance
// const apiUrl = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;

function LicenseManagement() {
    const queryClient = useQueryClient();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedLicenseType, setSelectedLicenseType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [queueSearchTerm, setQueueSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'noLicense'
    const [permissionsToRemove, setPermissionsToRemove] = useState([]);
    const [showRemovePermissions, setShowRemovePermissions] = useState(false);
    const [userPermissions, setUserPermissions] = useState({});
    const [licenseCounts, setLicenseCounts] = useState({});

    // Fetch users, modules, and permissions
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery(usersOptions());
    const { data: modules = [], isLoading: modulesLoading } = useQuery(modulesOptions());
    const { data: apiPermissions = {}, isLoading: permissionsLoading } = useQuery(permissionsOptions());
    
    // Fetch non-licensed users
    const { data: nonLicensedUsers = [], isLoading: isLoadingQueue } = useQuery({
        queryKey: ['nonLicensedUsers'],
        queryFn: fetchNonLicensedUsers,
    });

    // Filter non-licensed users based on search term
    const filteredQueueUsers = nonLicensedUsers.filter(user => 
        user.firstname?.toLowerCase().includes(queueSearchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(queueSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(queueSearchTerm.toLowerCase())
    );

    // Debug users data
    useEffect(() => {
        if (users) {
            console.log('Users data:', users);
            // Check for undefined values in users
            const undefinedUsers = users.filter(user => !user || !user.user_id);
            if (undefinedUsers.length > 0) {
                console.warn('Found users with undefined values:', undefinedUsers);
            }
        }
    }, [users]);

    // Handle users error
    useEffect(() => {
        if (usersError) {
            console.error('Error fetching users:', usersError);
            setError('Failed to load users. Please try again.');
        }
    }, [usersError]);

    // Initialize permissions when data is loaded
    useEffect(() => {
        if (apiPermissions && modules) {
            // Create permissions array dynamically based on modules
            const newPermissions = modules.map(module => {
                const moduleId = parseInt(module.module_id, 10);
                let modulePermissions = [];
                const userPermissions = apiPermissions.user || [];

                // Map the module to the correct type based on MODULES constant
                if (moduleId === MODULES.RISK_MANAGEMENT.id) {
                    const riskPermissions = apiPermissions.risk || [];
                    modulePermissions = [
                        {
                            title: "",
                            permissions: riskPermissions
                        },
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions
                        }
                    ];
                } else if (moduleId === MODULES.PROCESS_MANAGEMENT.id) {
                    modulePermissions = [
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions
                        }
                    ];
                }

                return {
                    id: `module-permissions-${moduleId}`,
                    name: `${module.module_name}`,
                    module_id: moduleId,
                    permissionGroups: modulePermissions,
                    type: moduleId === MODULES.RISK_MANAGEMENT.id ? 'risk' : 'user'
                };
            });
            
            setPermissions(newPermissions);
        }
    }, [apiPermissions, modules, MODULES.RISK_MANAGEMENT.id, MODULES.PROCESS_MANAGEMENT.id]);

    // Initialize license counts when modules data is loaded
    useEffect(() => {
        if (modules) {
            const initialCounts = {};
            modules.forEach(module => {
                initialCounts[module.module_id] = {};
                module.license_type.forEach(type => {
                    const [used, total] = type.usage.split('/').map(Number);
                    initialCounts[module.module_id][type.type_id] = {
                        used,
                        total,
                        available: total - used
                    };
                });
            });
            setLicenseCounts(initialCounts);
            console.log('Initial license counts:', initialCounts);
        }
    }, [modules]);

    const handleLicenseChange = useCallback((moduleId, licenseTypeId) => {
        moduleId = parseInt(moduleId, 10);
        licenseTypeId = parseInt(licenseTypeId, 10);
        
        // Check if the license is currently selected
        const isCurrentlySelected = selectedModule === moduleId && selectedLicenseType === licenseTypeId;
        
        // Log current state for debugging
        console.log('Before change:', {
            moduleId,
            licenseTypeId,
            isCurrentlySelected,
            currentCounts: licenseCounts[moduleId]?.[licenseTypeId],
            selectedModule,
            selectedLicenseType
        });

        if (isCurrentlySelected) {
            // If deselecting current selection
            setLicenseCounts(prev => {
                const newCounts = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
                const currentCount = newCounts[moduleId][licenseTypeId];
                newCounts[moduleId][licenseTypeId] = {
                    ...currentCount,
                    used: Math.max(0, currentCount.used - 1),
                    available: Math.min(currentCount.total, currentCount.available + 1)
                };
                return newCounts;
            });
            setSelectedModule(null);
            setSelectedLicenseType(null);
        } else {
            // If selecting new license
            setLicenseCounts(prev => {
                const newCounts = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
                
                // First, handle deselection of previous license if any
                if (selectedModule !== null && selectedLicenseType !== null) {
                    const prevCount = newCounts[selectedModule][selectedLicenseType];
                    newCounts[selectedModule][selectedLicenseType] = {
                        ...prevCount,
                        used: Math.max(0, prevCount.used - 1),
                        available: Math.min(prevCount.total, prevCount.available + 1)
                    };
                }
                
                // Then, handle selection of new license
                const newCount = newCounts[moduleId][licenseTypeId];
                newCounts[moduleId][licenseTypeId] = {
                    ...newCount,
                    used: Math.min(newCount.total, newCount.used + 1),
                    available: Math.max(0, newCount.available - 1)
                };
                
                // Log the changes for debugging
                console.log('After change:', {
                    newCounts: newCounts[moduleId][licenseTypeId],
                    deselectedCounts: selectedModule !== null ? newCounts[selectedModule][selectedLicenseType] : null
                });
                
                return newCounts;
            });
            
            // Update selection state after counts are updated
            setSelectedModule(moduleId);
            setSelectedLicenseType(licenseTypeId);
        }
    }, [selectedModule, selectedLicenseType]);

    // Toggle group collapse
    const toggleGroupCollapse = useCallback((groupId) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    }, []);

    // Check if all permissions in a group are selected
    const areAllPermissionsSelected = useCallback((permissions) => {
        return permissions.every(permission => 
            selectedPermissions.includes(parseInt(permission.permission_id, 10))
        );
    }, [selectedPermissions]);

    // Handle select all permissions in a group
    const handleSelectAllPermissions = useCallback((permissions) => {
        const allSelected = areAllPermissionsSelected(permissions);
        
        if (allSelected) {
            // Remove all permissions in this group
            const permissionIds = permissions.map(p => parseInt(p.permission_id, 10));
            setSelectedPermissions(prev => prev.filter(id => !permissionIds.includes(id)));
        } else {
            // Add all permissions in this group
            const permissionIds = permissions.map(p => parseInt(p.permission_id, 10));
            setSelectedPermissions(prev => {
                const newPermissions = [...prev];
                permissionIds.forEach(id => {
                    if (!newPermissions.includes(id)) {
                        newPermissions.push(id);
                    }
                });
                return newPermissions;
            });
        }
    }, [areAllPermissionsSelected]);

    // Handle individual permission change
    const handlePermissionChange = useCallback((permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    }, []);

    // Use the useAssignLicense hook from license-queries.js
    const { mutate: assignLicense, isPending: isAssigningLicense } = useAssignLicense({
        onSuccess: () => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['modules']);
            queryClient.invalidateQueries(['nonLicensedUsers']);
            
            // Show success message
            setSuccess('License assigned successfully');
            
            // Clear selections
            setSelectedUsers([]);
            setSelectedModule(null);
            setSelectedLicenseType(null);
            
            // Clear success message after 6 seconds
            setTimeout(() => setSuccess(null), 6000);
        },
        onError: (error) => {
            console.error('License assignment error:', error);
            setError(error.message || 'Failed to assign license');
            setTimeout(() => setError(null), 6000);
        }
    });

    // Use the useRemoveUserPermissions hook
    const { mutate: removePermissions, isPending: isRemovingPermissions } = useRemoveUserPermissions({
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setSuccess('Permissions removed successfully');
            setPermissionsToRemove([]);
            setShowRemovePermissions(false);
            setTimeout(() => setSuccess(null), 6000);
        },
        onError: (error) => {
            console.error('Permission removal error:', error);
            setError(error.message || 'Failed to remove permissions');
            setTimeout(() => setError(null), 6000);
        }
    });

    // Handle permission removal
    const handleRemovePermissions = async () => {
        if (selectedUsers.length === 0 || permissionsToRemove.length === 0) {
            setError('Please select users and permissions to remove');
            return;
        }

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const userId of selectedUsers) {
                try {
                    await removePermissions({
                        userId,
                        permissionIds: permissionsToRemove
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to remove permissions from user ${userId}:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                if (errorCount > 0) {
                    setSuccess(`Successfully removed permissions from ${successCount} users, but failed for ${errorCount} users.`);
                } else {
                    setSuccess(`Successfully removed permissions from ${successCount} users.`);
                }
                
                // Clear selections
                setSelectedUsers([]);
                setPermissionsToRemove([]);
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries(['users']);

                // Add a slight delay before refreshing the page
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // 1.5 second delay to show the success message
            } else {
                setError(`Failed to remove permissions from any users. Please try again.`);
            }
        } catch (error) {
            console.error('Error in handleRemovePermissions:', error);
            setError('Failed to remove permissions. Please try again.');
        }
    };

    // Fetch user permissions when a user is selected
    const fetchUserPermissions = async (userId) => {
        const token = get(ACCESS_TOKEN_NAME);
        try {
            console.log('Fetching permissions for user:', userId);
            const response = await axios.get(
                `clarion_users/users/${userId}/permissions/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Log the raw response for debugging
            console.log('Raw permissions response for user', userId, ':', response.data);
            
            // Extract permissions, handling different possible response formats
            let permissions = [];
            
            if (response.data) {
                if (Array.isArray(response.data.permission_ids)) {
                    // If response.data.permission_ids is an array, use it directly
                    permissions = response.data.permission_ids;
                } else if (Array.isArray(response.data)) {
                    // If response.data is an array, assume it's the permissions array
                    permissions = response.data;
                } else if (response.data.permissions && Array.isArray(response.data.permissions)) {
                    // If response.data.permissions is an array, extract permission IDs
                    permissions = response.data.permissions.map(p => 
                        typeof p === 'object' ? (p.permission_id || p.id) : p
                    );
                }
            }
            
            // Ensure all permission IDs are numbers
            const parsedPermissions = permissions.map(p => 
                typeof p === 'object' ? parseInt(p.id || p.permission_id, 10) : parseInt(p, 10)
            ).filter(id => !isNaN(id)); // Filter out any NaN values
            
            console.log('Parsed permissions for user:', userId, parsedPermissions);
            
            // Update the userPermissions state with the fetched permissions
            setUserPermissions(prev => ({
                ...prev,
                [userId]: parsedPermissions
            }));
            
            return { permission_ids: parsedPermissions };
        } catch (error) {
            console.error('Error fetching user permissions:', error);
            // Set empty array instead of undefined
            setUserPermissions(prev => ({
                ...prev,
                [userId]: []
            }));
            // Don't throw the error, just return empty permissions
            return { permission_ids: [] };
        }
    };

    // Handle user selection in remove permissions tab
    const handleUserSelection = async (userId, isSelected) => {
        if (showRemovePermissions) {
            // For Remove Permissions tab, only allow one selection
            setSelectedUsers(isSelected ? [userId] : []);
            
            // Then fetch permissions if needed
            if (isSelected && !userPermissions[userId]) {
                try {
                    await fetchUserPermissions(userId);
                } catch (error) {
                    console.error('Error fetching permissions for user:', userId, error);
                }
            }
        } else {
            // For Manage Permissions tab, keep existing multiple selection behavior
            if (isSelected) {
                setSelectedUsers(prev => [...prev, userId]);
            } else {
                setSelectedUsers(prev => prev.filter(id => id !== userId));
            }
        }
    };

    // Add a useEffect to trigger after userPermissions changes
    useEffect(() => {
        if (selectedUsers.length > 0) {
            // Log the current state for debugging
            console.log('userPermissions changed:', userPermissions);
            console.log('Selected users:', selectedUsers);
            
            // Check if all selected users have their permissions loaded
            const allUsersLoaded = selectedUsers.every(userId => 
                userPermissions[userId] !== undefined
            );
            
            if (allUsersLoaded) {
                console.log('All selected users have permissions loaded');
                // Initialize permissionsToRemove as empty array instead of populating it
                setPermissionsToRemove([]);
            }
        }
    }, [userPermissions, selectedUsers]);

    // Check if all permissions in a group are selected for removal
    const areAllPermissionsSelectedForRemoval = useCallback((permissions) => {
        return permissions.every(permission => 
            permissionsToRemove.includes(parseInt(permission.permission_id, 10))
        );
    }, [permissionsToRemove]);

    // Handle select all permissions for removal
    const handleSelectAllPermissionsForRemoval = useCallback((permissions) => {
        const allSelected = areAllPermissionsSelectedForRemoval(permissions);
        
        if (allSelected) {
            // Remove all permissions in this group
            const permissionIds = permissions.map(p => parseInt(p.permission_id, 10));
            setPermissionsToRemove(prev => prev.filter(id => !permissionIds.includes(id)));
        } else {
            // Add all permissions in this group
            const permissionIds = permissions.map(p => parseInt(p.permission_id, 10));
            setPermissionsToRemove(prev => {
                const newPermissions = [...prev];
                permissionIds.forEach(id => {
                    if (!newPermissions.includes(id)) {
                        newPermissions.push(id);
                    }
                });
                return newPermissions;
            });
        }
    }, [areAllPermissionsSelectedForRemoval]);

    // Handle individual permission change for removal
    const handlePermissionChangeForRemoval = useCallback((permissionId) => {
        setPermissionsToRemove(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    }, []);

    // Handle license assignment
    const handleAssignLicense = async () => {
        if (!selectedModule || !selectedLicenseType || selectedUsers.length === 0) {
            setError('Please select module, license type, and at least one user');
            return;
        }

        try {
            setError(null);
            let successCount = 0;
            let errorCount = 0;

            for (const userId of selectedUsers) {
                try {
                    // First, get the user's current licenses and permissions
                    const userResponse = await axios.get(
                        `clarion_users/users/${userId}/`,
                        {
                            headers: {
                                'Authorization': `Bearer ${get(ACCESS_TOKEN_NAME)}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    const currentLicenses = userResponse.data.licenses || [];
                    const currentPermissions = userResponse.data.permissions || [];
                    
                    // Create new licenses array, preserving all existing licenses
                    const updatedLicenses = [...currentLicenses];
                    
                    // Remove any existing license for the selected module
                    const moduleIndex = updatedLicenses.findIndex(
                        license => license.module_id === parseInt(selectedModule, 10)
                    );
                    
                    // Update or add the new license
                    const newLicense = {
                        module_id: parseInt(selectedModule, 10),
                        license_type_id: parseInt(selectedLicenseType, 10)
                    };
                    
                    if (moduleIndex !== -1) {
                        updatedLicenses[moduleIndex] = newLicense;
                    } else {
                        updatedLicenses.push(newLicense);
                    }
                    
                    // Get current permission IDs
                    const currentPermissionIds = currentPermissions.map(p => 
                        parseInt(p.permission_id || p.id, 10)
                    );
                    
                    // Combine current permissions with newly selected ones
                    const updatedPermissionIds = Array.from(new Set([
                        ...currentPermissionIds,
                        ...selectedPermissions.map(id => parseInt(id, 10))
                    ]));
                    
                    // Update user with new licenses and permissions
                    await axios.put(
                        `clarion_users/users/${userId}/update/`,
                        {
                            user_details: {},  // Keep existing user details
                            user_licenses: updatedLicenses,
                            user_permissions: {
                                permission_ids: updatedPermissionIds,
                                set_as_admin: userResponse.data.is_admin || false
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${get(ACCESS_TOKEN_NAME)}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    successCount++;
                } catch (userError) {
                    console.error(`Failed to assign/update license for user ${userId}:`, userError);
                    errorCount++;
                }
            }

            // Show success/error message
            if (successCount > 0) {
                setSuccess(`Successfully assigned licenses to ${successCount} user(s)`);
                if (errorCount > 0) {
                    setError(`Failed to assign licenses to ${errorCount} user(s)`);
                }
                
                // Refresh data
                queryClient.invalidateQueries(['users']);
                queryClient.invalidateQueries(['modules']);
                queryClient.invalidateQueries(['nonLicensedUsers']);
            } else {
                setError('Failed to assign licenses to any users');
            }

            // Clear selections after successful assignment
            if (successCount > 0) {
                setSelectedUsers([]);
                setSelectedModule(null);
                setSelectedLicenseType(null);
                setSelectedPermissions([]);
            }

            // Clear messages after 8 seconds
            setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 8000);
        } catch (error) {
            console.error('Error in handleAssignLicense:', error);
            setError('Failed to assign/update licenses. Please try again.');
            setTimeout(() => setError(null), 8000);
        }
    };

    // Update user permissions
    const updateUserPermissions = async (userId) => {
        const token = get(ACCESS_TOKEN_NAME);
        try {
            console.log('Updating permissions for user:', userId);
            console.log('Permissions data:', {
                permission_ids: selectedPermissions,
                set_as_admin: false
            });
            
            const response = await axios.put(
                `clarion_users/users/${userId}/permissions/update/`,
                {
                    permission_ids: selectedPermissions.map(id => parseInt(id, 10)),
                    set_as_admin: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Permissions update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Permissions update error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            }
            throw new Error(error.response?.data?.message || 'Failed to update permissions');
        }
    };

    // Filter users based on search term and ensure they have required properties
    const filteredUsers = users.filter(user => {
        if (!user || !user.user_id) return false;
        const searchString = `${user.firstname || user.first_name || ''} ${user.lastname || user.last_name || ''} ${user.email || ''}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    // Check if a module is selected
    const isModuleSelected = useCallback((moduleId) => {
        moduleId = parseInt(moduleId, 10);
        return selectedModule === moduleId;
    }, [selectedModule]);

    if (usersLoading || modulesLoading || permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (usersError) {
        return (
            <div className="p-6">
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    Failed to load users. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Privileges</h1>

            {/* Tabs for License Management and Remove Permissions */}
            <div className="mb-6 flex border-b">
                <button
                    className={`px-4 py-2 font-medium ${
                        !showRemovePermissions
                            ? 'border-b-2 border-pink-500 text-pink-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setShowRemovePermissions(false)}
                >
                    Manage Permissions
                </button>
                <button
                    className={`px-4 py-2 font-medium ${
                        showRemovePermissions
                            ? 'border-b-2 border-pink-500 text-pink-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setShowRemovePermissions(true)}
                >
                    Remove Permissions
                </button>
            </div>

            {!showRemovePermissions ? (
                <>
                    {/* User Selection - Moved to top */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Users</h2>
                        
                        {/* Tabs for All Users and No License Users */}
                        <div className="mb-4 flex border-b">
                            <button
                                className={`px-6 py-3 font-medium text-base ${
                                    activeTab === 'all'
                                        ? 'border-b-2 border-pink-500 text-pink-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setActiveTab('all')}
                            >
                                All Users
                            </button>
                            <button
                                className={`px-6 py-3 font-medium text-base ${
                                    activeTab === 'noLicense'
                                        ? 'border-b-2 border-pink-500 text-pink-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setActiveTab('noLicense')}
                            >
                                My Queue
                            </button>
                        </div>
                        
                        {/* Search input */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder={activeTab === 'all' ? "Search users..." : "Search no license users..."}
                                className="w-full p-3 border rounded-lg text-base placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                value={activeTab === 'all' ? searchTerm : queueSearchTerm}
                                onChange={(e) => activeTab === 'all' 
                                    ? setSearchTerm(e.target.value) 
                                    : setQueueSearchTerm(e.target.value)
                                }
                            />
                        </div>
                        
                        {/* User list based on active tab */}
                        <div className="max-h-96 overflow-y-auto border rounded-lg bg-white shadow-sm">
                            {activeTab === 'all' ? (
                                // All Users tab
                                filteredUsers.map(user => (
                                    <div
                                        key={user.user_id}
                                        className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mr-4 h-5 w-5 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                                            checked={selectedUsers.includes(user.user_id)}
                                            onChange={(e) => handleUserSelection(user.user_id, e.target.checked)}
                                        />
                                        <div className="flex flex-col">
                                            <div className="text-base font-medium text-gray-900">
                                                {`${user.firstname || user.first_name || ''} ${user.lastname || user.last_name || ''}`}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {user.email || 'No email'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // No License Users tab
                                isLoadingQueue ? (
                                    <div className="p-6 text-center text-base text-gray-600">Loading no license users...</div>
                                ) : filteredQueueUsers.length > 0 ? (
                                    filteredQueueUsers.map((user) => (
                                        <div
                                            key={user.email}
                                            className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                            onClick={() => {
                                                const isAlreadySelected = selectedUsers.includes(user.email);
                                                if (isAlreadySelected) {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user.email));
                                                } else {
                                                    setSelectedUsers([...selectedUsers, user.email]);
                                                }
                                            }}
                                        >
                                            <div className={`flex flex-col ${selectedUsers.includes(user.email) ? "text-pink-600" : ""}`}>
                                                <div className="text-base font-medium">{`${user.firstname || user.first_name || ''} ${user.lastname || user.last_name || ''}`}</div>
                                                <div className="text-sm mt-1">{user.email}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-base text-gray-600">No non-licensed users found</div>
                                )
                            )}
                        </div>
                    </div>

                    {/* License Section - Moved below user selection */}
                    <div className="w-full">
                        <div className="p-4 border rounded-lg bg-white">
                            <h3 className="text-lg font-medium mb-4">Licenses</h3>
                            <div className="space-y-4">
                                {modules?.map((module, moduleIndex) => (
                                    <div key={`module-license-${module.module_id}-${moduleIndex}`} className="border-b pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-medium">{module.module_name}</div>
                                            <div className="text-sm text-gray-500">
                                                Total: {licenseCounts[module.module_id] ? 
                                                    Object.values(licenseCounts[module.module_id]).reduce((sum, type) => sum + type.used, 0) + 
                                                    '/' + 
                                                    Object.values(licenseCounts[module.module_id]).reduce((sum, type) => sum + type.total, 0) 
                                                    : module.license_usage}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {module.license_type.map(type => {
                                                const isSelected = selectedModule === module.module_id && selectedLicenseType === type.type_id;
                                                const countInfo = licenseCounts[module.module_id]?.[type.type_id] || { used: 0, total: 0 };
                                                const available = countInfo.total - countInfo.used;
                                                
                                                return (
                                                    <div key={`license-type-${module.module_id}-${type.type_id}`} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            name={`license-${module.module_id}`}
                                                            checked={isSelected}
                                                            onChange={() => handleLicenseChange(module.module_id, type.type_id)}
                                                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                            disabled={!isSelected && available <= 0}
                                                        />
                                                        <span className="text-sm">
                                                            {type.type} ({countInfo.used}/{countInfo.total})
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    {selectedModule && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold mb-4">Permissions</h2>
                            <div className="flex flex-col gap-4">
                                {permissions
                                    .filter(section => section.module_id === selectedModule)
                                    .map((section, sectionIndex) => (
                                        <div key={`module-permissions-${section.module_id}-${sectionIndex}`} className="p-4 border rounded-lg bg-gray-50">
                                            <h3 className="text-lg font-medium mb-4">{section.name} Permissions</h3>
                                            <div className="space-y-6">
                                                {section.permissionGroups && section.permissionGroups.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {section.permissionGroups.map((group, groupIndex) => {
                                                            const allPermissions = group.permissions || [];
                                                            if (allPermissions.length === 0) return null;
                                                            const groupId = `${section.module_id}-${groupIndex}`;
                                                            const isCollapsed = collapsedGroups.has(groupId);

                                                            return (
                                                                <div key={`permission-group-${groupIndex}`} className="space-y-4">
                                                                    <div 
                                                                        className="border-b pb-2 cursor-pointer" 
                                                                        onClick={() => toggleGroupCollapse(groupId)}
                                                                    >
                                                                        <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                                                            <h4 className="text-md font-medium">{group.title}</h4>
                                                                            <div className="transform transition-transform duration-200" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                                                                <IoIosArrowDown />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {!isCollapsed && (
                                                                        <>
                                                                            <div className="mb-4 flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={areAllPermissionsSelected(allPermissions)}
                                                                                    onChange={() => handleSelectAllPermissions(allPermissions)}
                                                                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                                                    id={`select-all-${section.module_id}-${groupIndex}`}
                                                                                />
                                                                                <label 
                                                                                    htmlFor={`select-all-${section.module_id}-${groupIndex}`} 
                                                                                    className="text-sm"
                                                                                >
                                                                                    Select All
                                                                                </label>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                {allPermissions.map((permission) => {
                                                                                    const permissionId = parseInt(permission.permission_id, 10);
                                                                                    const isChecked = selectedPermissions.includes(permissionId);
                                                                                    
                                                                                    return (
                                                                                        <div key={`permission-${permissionId}`} className="flex items-start gap-2">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isChecked}
                                                                                                onChange={() => handlePermissionChange(permissionId)}
                                                                                                className="mt-1 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                                                                id={`permission-${permissionId}`}
                                                                                            />
                                                                                            <label htmlFor={`permission-${permissionId}`} className="text-sm">
                                                                                                <div className="font-medium">{permission.name}</div>
                                                                                                {permission.description && (
                                                                                                    <div className="text-gray-500">{permission.description}</div>
                                                                                                )}
                                                                                            </label>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500">No permissions available for this module.</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            onClick={() => {
                                setSelectedUsers([]);
                                setSelectedModule(null);
                                setSelectedLicenseType(null);
                                setSearchTerm('');
                                setQueueSearchTerm('');
                                setSelectedPermissions([]);
                            }}
                        >
                            Clear Selection
                        </button>
                        <button
                            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleAssignLicense}
                            disabled={!selectedModule || !selectedLicenseType || selectedUsers.length === 0 || isAssigningLicense}
                        >
                            {isAssigningLicense ? 'Assigning...' : 'Assign License & Permissions'}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Remove Permissions UI */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Select User to Remove Permissions From</h2>
                        
                        {/* Search input */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full p-3 border rounded-lg text-base placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* User list with radio buttons */}
                        <div className="max-h-96 overflow-y-auto border rounded-lg bg-white shadow-sm">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.user_id}
                                    className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <input
                                        type="radio"
                                        name="userSelection"
                                        className="mr-4 h-5 w-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                                        checked={selectedUsers.includes(user.user_id)}
                                        onChange={() => handleUserSelection(user.user_id, true)}
                                    />
                                    <div className="flex flex-col">
                                        <div className="text-base font-medium text-gray-900">
                                            {`${user.firstname || user.first_name || ''} ${user.lastname || user.last_name || ''}`}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {user.email || 'No email'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions to Remove Section */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Permissions to Remove</h2>
                        <div className="flex flex-col gap-4">
                            {selectedUsers.length > 0 ? 
                                (() => {
                                    // Debug logging to help diagnose the issue
                                    console.log('selectedUsers:', selectedUsers);
                                    console.log('userPermissions:', userPermissions);
                                    
                                    // Check if any selected user has permissions
                                    const anyUserHasPermissions = selectedUsers.some(userId => 
                                        Array.isArray(userPermissions[userId]) && userPermissions[userId].length > 0
                                    );
                                    
                                    console.log('anyUserHasPermissions:', anyUserHasPermissions);
                                    
                                    if (anyUserHasPermissions) {
                                        return permissions.map((section, sectionIndex) => {
                                            // Get all permissions from this section that are assigned to selected users
                                            const assignedSectionPermissions = section.permissionGroups?.flatMap(group => 
                                                (group.permissions || []).filter(permission => {
                                                    const permissionId = parseInt(permission.permission_id, 10);
                                                    return selectedUsers.some(userId => 
                                                        userPermissions[userId]?.includes(permissionId)
                                                    );
                                                })
                                            ) || [];
                                            
                                            // Skip this section if no assigned permissions
                                            if (assignedSectionPermissions.length === 0) return null;
                                            
                                            return (
                                                <div key={`module-permissions-${section.module_id}-${sectionIndex}`} 
                                                    className="p-4 border rounded-lg bg-white shadow-sm">
                                                    <h3 className="text-lg font-medium mb-4 text-gray-800">{section.name} Permissions</h3>
                                                    <div className="space-y-6">
                                                        <div className="space-y-6">
                                                            {section.permissionGroups.map((group, groupIndex) => {
                                                                // Filter to only show permissions assigned to selected users
                                                                const assignedPermissions = (group.permissions || []).filter(permission => {
                                                                    const permissionId = parseInt(permission.permission_id, 10);
                                                                    return selectedUsers.some(userId => 
                                                                        userPermissions[userId]?.includes(permissionId)
                                                                    );
                                                                });
                                                                
                                                                // Skip this group if no assigned permissions
                                                                if (assignedPermissions.length === 0) return null;
                                                                
                                                                const groupId = `${section.module_id}-${groupIndex}`;
                                                                const isCollapsed = collapsedGroups.has(groupId);

                                                                return (
                                                                    <div key={`permission-group-${groupIndex}`} className="space-y-4">
                                                                        <div 
                                                                            className="border-b pb-2 cursor-pointer" 
                                                                            onClick={() => toggleGroupCollapse(groupId)}
                                                                        >
                                                                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                                                <h4 className="text-base font-medium text-gray-800">{group.title}</h4>
                                                                                <div className="transform transition-transform duration-200" 
                                                                                    style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                                                                    <IoIosArrowDown className="text-gray-600 text-xl" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {!isCollapsed && (
                                                                            <>
                                                                                <div className="mb-4 flex items-center gap-2 p-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={areAllPermissionsSelectedForRemoval(assignedPermissions)}
                                                                                        onChange={() => handleSelectAllPermissionsForRemoval(assignedPermissions)}
                                                                                        className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                                                        id={`select-all-remove-${section.module_id}-${groupIndex}`}
                                                                                    />
                                                                                    <label 
                                                                                        htmlFor={`select-all-remove-${section.module_id}-${groupIndex}`} 
                                                                                        className="text-base font-medium text-gray-700"
                                                                                    >
                                                                                        Select All
                                                                                    </label>
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-4 p-2">
                                                                                    {assignedPermissions.map((permission) => {
                                                                                        const permissionId = parseInt(permission.permission_id, 10);
                                                                                        const isChecked = permissionsToRemove.includes(permissionId);
                                                                                        
                                                                                        return (
                                                                                            <div key={`permission-${permissionId}`} 
                                                                                                className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={isChecked}
                                                                                                    onChange={() => handlePermissionChangeForRemoval(permissionId)}
                                                                                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                                                                    id={`permission-remove-${permissionId}`}
                                                                                                />
                                                                                                <label htmlFor={`permission-remove-${permissionId}`} 
                                                                                                    className="flex flex-col gap-1">
                                                                                                    <div className="text-base font-medium text-gray-800">
                                                                                                        {permission.name}
                                                                                                    </div>
                                                                                                    {permission.description && (
                                                                                                        <div className="text-sm text-gray-600">
                                                                                                            {permission.description}
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <div className="text-sm mt-1">
                                                                                                        <span className="text-green-600 font-medium">
                                                                                                            Assigned to {selectedUsers.filter(userId => 
                                                                                                                userPermissions[userId]?.includes(permissionId)
                                                                                                            ).length} selected user(s)
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </label>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    } else {
                                        return (
                                            <div className="p-8 text-center border rounded-lg bg-white shadow-sm">
                                                <div className="text-lg text-gray-600">
                                                    {selectedUsers.length === 1 ? "User has" : "Selected users have"} no permissions assigned
                                                </div>
                                            </div>
                                        );
                                    }
                                })()
                             : (
                                <div className="p-8 text-center border rounded-lg bg-white shadow-sm">
                                    <div className="text-lg text-gray-600">
                                        Please select a user to view their permissions
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            onClick={() => {
                                setSelectedUsers([]);
                                setPermissionsToRemove([]);
                                setUserPermissions({});
                            }}
                        >
                            Clear Selection
                        </button>
                        <button
                            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleRemovePermissions}
                            disabled={selectedUsers.length === 0 || permissionsToRemove.length === 0 || isRemovingPermissions}
                        >
                            {isRemovingPermissions ? 'Removing...' : 'Remove Permissions'}
                        </button>
                    </div>
                </>
            )}
            
            {/* Error and Success Messages */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg shadow-lg">
                        {success}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LicenseManagement;