import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersOptions, fetchNonLicensedUsers, useRemoveUserPermissions } from '../../../queries/users-queries';
import { permissionsOptions } from '../../../queries/permissions/permissions-queries';
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
    const [selectedModules, setSelectedModules] = useState([]);
    const [selectedLicenseTypes, setSelectedLicenseTypes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [queueSearchTerm, setQueueSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [activeTab, setActiveTab] = useState('queue');
    const [permissionsToRemove, setPermissionsToRemove] = useState([]);
    const [showRemovePermissions, setShowRemovePermissions] = useState(false);
    const [userPermissions, setUserPermissions] = useState({});
    const [licenseCounts, setLicenseCounts] = useState({});
    const [currentUserLicenses, setCurrentUserLicenses] = useState({});
    const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
    const [licenseError, setLicenseError] = useState(null);
    const [multiModuleSelection, setMultiModuleSelection] = useState(true);

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
            console.log('API Permissions received:', apiPermissions);
            console.log('Process permissions available:', apiPermissions.process ? apiPermissions.process.length : 0);
            
            const newPermissions = modules.map(module => {
                const moduleId = parseInt(module.module_id, 10);
                let modulePermissions = [];
                const userPermissions = apiPermissions.user || [];
                const processPermissions = apiPermissions.process || [];
                
                console.log(`Processing module ${module.module_name} (ID: ${moduleId})`);
                console.log(`Process permissions count: ${processPermissions.length}`);

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
                            title: "Process Management Permissions",
                            permissions: processPermissions
                        },
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions
                        }
                    ];
                    
                    console.log('Process module permissions:', JSON.stringify(modulePermissions, null, 2));
                }

                return {
                    id: `module-permissions-${moduleId}`,
                    name: `${module.module_name}`,
                    module_id: moduleId,
                    permissionGroups: modulePermissions,
                    type: moduleId === MODULES.RISK_MANAGEMENT.id ? 'risk' : (moduleId === MODULES.PROCESS_MANAGEMENT.id ? 'process' : 'user')
                };
            });
            
            console.log('Setting permissions:', newPermissions);
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
        
        // Check if this module-license combination is already selected
        const moduleIndex = selectedModules.indexOf(moduleId);
        const isModuleSelected = moduleIndex !== -1;
        const isLicenseSelected = isModuleSelected && selectedLicenseTypes[moduleId] === licenseTypeId;
        
        // Log current state for debugging
        console.log('Before change:', {
            moduleId,
            licenseTypeId,
            isModuleSelected,
            isLicenseSelected,
            selectedModules,
            selectedLicenseTypes,
            currentCounts: licenseCounts[moduleId]?.[licenseTypeId]
        });

        if (isLicenseSelected) {
            // If deselecting, remove this module from selections
            const newSelectedModules = [...selectedModules];
            newSelectedModules.splice(moduleIndex, 1);
            
            const newSelectedLicenseTypes = {...selectedLicenseTypes};
            delete newSelectedLicenseTypes[moduleId];
            
            // Update counts
            setLicenseCounts(prev => {
                const newCounts = JSON.parse(JSON.stringify(prev));
                const currentCount = newCounts[moduleId][licenseTypeId];
                newCounts[moduleId][licenseTypeId] = {
                    ...currentCount,
                    used: Math.max(0, currentCount.used - 1),
                    available: Math.min(currentCount.total, currentCount.available + 1)
                };
                return newCounts;
            });
            
            setSelectedModules(newSelectedModules);
            setSelectedLicenseTypes(newSelectedLicenseTypes);
        } else {
            // Handle existing license for this module if already selected
            if (isModuleSelected) {
                // Update counts for previously selected license type
                const previousLicenseType = selectedLicenseTypes[moduleId];
                setLicenseCounts(prev => {
                    const newCounts = JSON.parse(JSON.stringify(prev));
                    const prevCount = newCounts[moduleId][previousLicenseType];
                    newCounts[moduleId][previousLicenseType] = {
                        ...prevCount,
                        used: Math.max(0, prevCount.used - 1),
                        available: Math.min(prevCount.total, prevCount.available + 1)
                    };
                    return newCounts;
                });
            }
            
            // Then add or update the selection
            const newSelectedModules = isModuleSelected ? [...selectedModules] : [...selectedModules, moduleId];
            const newSelectedLicenseTypes = {...selectedLicenseTypes, [moduleId]: licenseTypeId};
            
            // Update counts for new selection
            setLicenseCounts(prev => {
                const newCounts = JSON.parse(JSON.stringify(prev));
                const newCount = newCounts[moduleId][licenseTypeId];
                newCounts[moduleId][licenseTypeId] = {
                    ...newCount,
                    used: Math.min(newCount.total, newCount.used + 1),
                    available: Math.max(0, newCount.available - 1)
                };
                return newCounts;
            });
            
            setSelectedModules(newSelectedModules);
            setSelectedLicenseTypes(newSelectedLicenseTypes);
        }
    }, [selectedModules, selectedLicenseTypes]);

    // Toggle multi-module selection
    const toggleMultiModuleSelection = useCallback(() => {
        setMultiModuleSelection(prev => !prev);
    }, []);

    // Quick selection for Risk + Process Management
    const selectRiskAndProcessManagement = useCallback(() => {
        // Find Risk Management module and license type
        const riskModule = modules?.find(m => m.module_id === MODULES.RISK_MANAGEMENT.id);
        const riskLicenseType = riskModule?.license_type.find(lt => lt.type.toLowerCase() === 'full access')?.type_id || 1;
        
        // Find Process Management module and license type
        const processModule = modules?.find(m => m.module_id === MODULES.PROCESS_MANAGEMENT.id);
        const processLicenseType = processModule?.license_type.find(lt => lt.type.toLowerCase() === 'full access')?.type_id || 1;
        
        // Select both modules with their license types
        if (!selectedModules.includes(MODULES.RISK_MANAGEMENT.id)) {
            handleLicenseChange(MODULES.RISK_MANAGEMENT.id, riskLicenseType);
        }
        
        if (!selectedModules.includes(MODULES.PROCESS_MANAGEMENT.id)) {
            handleLicenseChange(MODULES.PROCESS_MANAGEMENT.id, processLicenseType);
        }
    }, [modules, selectedModules, handleLicenseChange]);

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
            setSelectedModules([]);
            setSelectedLicenseTypes({});
            
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
                    console.log('Using permission_ids array from response');
                } else if (Array.isArray(response.data)) {
                    // If response.data is an array, assume it's the permissions array
                    permissions = response.data;
                    console.log('Using direct array from response');
                } else if (response.data.permissions && Array.isArray(response.data.permissions)) {
                    // If response.data.permissions is an array, extract permission IDs
                    permissions = response.data.permissions.map(p => 
                        typeof p === 'object' ? (p.permission_id || p.id) : p
                    );
                    console.log('Using permissions array from response');
                }
            }
            
            // Ensure all permission IDs are numbers
            const parsedPermissions = permissions.map(p => 
                typeof p === 'object' ? parseInt(p.id || p.permission_id, 10) : parseInt(p, 10)
            ).filter(id => !isNaN(id)); // Filter out any NaN values
            
            console.log('Parsed permissions for user:', userId, parsedPermissions);
            
            // Log which permissions are process permissions if we have API permissions data
            if (apiPermissions && apiPermissions.process) {
                const processPermissionIds = apiPermissions.process.map(p => 
                    parseInt(p.permission_id, 10)
                );
                
                const userProcessPermissions = parsedPermissions.filter(id => 
                    processPermissionIds.includes(id)
                );
                
                console.log('User process permissions:', userProcessPermissions);
                console.log('Process permission IDs available:', processPermissionIds);
            }
            
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

    // Handle user selection for both managing and removing permissions
    const handleUserSelection = async (userId, isSelected) => {
        // Only allow one user selection at a time
        setSelectedUsers(isSelected ? [userId] : []);
        
        if (isSelected) {
            // Fetch user's permissions
            if (!userPermissions[userId]) {
                try {
                    await fetchUserPermissions(userId);
                } catch (error) {
                    console.error('Error fetching permissions for user:', userId, error);
                }
            }

            // Clear previous selections
            setSelectedModules([]);
            setSelectedLicenseTypes({});

            // Fetch user's current license info
            setIsLoadingLicenses(true);
            setLicenseError(null);
            try {
                const response = await axios.get(
                    `clarion_users/users/${userId}/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${get(ACCESS_TOKEN_NAME)}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                let userLicenses = [];
                if (response.data.licenses) {
                    userLicenses = Array.isArray(response.data.licenses) ? response.data.licenses : [];
                } else if (response.data.user_licenses) {
                    userLicenses = Array.isArray(response.data.user_licenses) ? response.data.user_licenses : [];
                }
                
                setCurrentUserLicenses(prev => ({
                    ...prev,
                    [userId]: userLicenses
                }));

                // Auto-select the user's existing licenses
                if (userLicenses && userLicenses.length > 0) {
                    // Set up temporary arrays/objects to collect module IDs and license types
                    const newSelectedModules = [];
                    const newSelectedLicenseTypes = {};
                    
                    // Process each license
                    userLicenses.forEach(license => {
                        const moduleId = parseInt(license.module_id, 10);
                        const licenseTypeId = parseInt(license.license_type_id, 10);
                        
                        if (!isNaN(moduleId) && !isNaN(licenseTypeId)) {
                            newSelectedModules.push(moduleId);
                            newSelectedLicenseTypes[moduleId] = licenseTypeId;
                            
                            // Also update license counts to match current selection
                            setLicenseCounts(prev => {
                                const newCounts = JSON.parse(JSON.stringify(prev));
                                if (newCounts[moduleId] && newCounts[moduleId][licenseTypeId]) {
                                    const currentCount = newCounts[moduleId][licenseTypeId];
                                    newCounts[moduleId][licenseTypeId] = {
                                        ...currentCount,
                                        used: Math.min(currentCount.total, currentCount.used + 1),
                                        available: Math.max(0, currentCount.available - 1)
                                    };
                                }
                                return newCounts;
                            });
                        }
                    });
                    
                    console.log('Setting selected modules:', newSelectedModules);
                    console.log('Setting selected license types:', newSelectedLicenseTypes);
                    
                    // Now actually set the state with all modules and license types collected
                    setSelectedModules(newSelectedModules);
                    setSelectedLicenseTypes(newSelectedLicenseTypes);
                }
            } catch (error) {
                console.error('Error fetching user licenses:', error);
                setLicenseError(`Failed to fetch licenses for user`);
            } finally {
                setIsLoadingLicenses(false);
            }
        } else {
            // Clear user's data when deselected
            setCurrentUserLicenses(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
            // Clear any selected permissions to remove
            setPermissionsToRemove([]);
            // Clear license selections
            setSelectedModules([]);
            setSelectedLicenseTypes({});
        }
    };
    
    // Helper function to update license counts based on a user's current licenses
    const updateLicenseCountsForUser = useCallback((userLicenses) => {
        if (!userLicenses || userLicenses.length === 0) return;
        
        setLicenseCounts(prev => {
            const newCounts = JSON.parse(JSON.stringify(prev)); // Deep clone
            
            userLicenses.forEach(license => {
                const moduleId = parseInt(license.module_id, 10);
                const licenseTypeId = parseInt(license.license_type_id, 10);
                
                if (newCounts[moduleId] && newCounts[moduleId][licenseTypeId]) {
                    // Update count to reflect this license is already used
                    const currentCount = newCounts[moduleId][licenseTypeId];
                    if (currentCount.used < currentCount.total) {
                        newCounts[moduleId][licenseTypeId] = {
                            ...currentCount,
                            used: currentCount.used + 1,
                            available: Math.max(0, currentCount.available - 1)
                        };
                    }
                }
            });
            
            return newCounts;
        });
    }, []);

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

    // Handle license assignment with support for multiple modules
    const handleAssignLicense = async () => {
        if (selectedModules.length === 0 || Object.keys(selectedLicenseTypes).length === 0 || selectedUsers.length === 0) {
            setError('Please select at least one module, license type, and user');
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
                    
                    // Create new licenses array, preserving licenses for modules not in our selection
                    const updatedLicenses = currentLicenses.filter(license => 
                        !selectedModules.includes(parseInt(license.module_id, 10))
                    );
                    
                    // Add all selected modules with their license types
                    selectedModules.forEach(moduleId => {
                        const licenseTypeId = selectedLicenseTypes[moduleId];
                        updatedLicenses.push({
                            module_id: parseInt(moduleId, 10),
                            license_type_id: parseInt(licenseTypeId, 10)
                        });
                    });
                    
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
                setSelectedModules([]);
                setSelectedLicenseTypes({});
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
        return selectedModules.includes(moduleId);
    }, [selectedModules]);

    // Clear selection button click handler
    const handleClearSelection = () => {
        setSelectedUsers([]);
        setSelectedModules([]);
        setSelectedLicenseTypes({});
        setSearchTerm('');
        setQueueSearchTerm('');
        setSelectedPermissions([]);
        setCurrentUserLicenses({});
        setLicenseError(null);
        setActiveTab('queue');
    };

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

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`${
                            activeTab === 'queue'
                                ? 'border-pink-500 text-pink-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        My Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`${
                            activeTab === 'manage'
                                ? 'border-pink-500 text-pink-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Manage Permissions
                    </button>
                </nav>
            </div>

            {/* Queue Users Tab Content */}
            {activeTab === 'queue' && (
                <div className="mb-6">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search My Queue..."
                            value={queueSearchTerm}
                            onChange={(e) => setQueueSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto border rounded-lg">
                        {isLoadingQueue ? (
                            <div className="flex justify-center items-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredQueueUsers.length > 0 ? (
                            filteredQueueUsers.map(user => (
                                <div
                                    key={user.user_id}
                                    className="p-4 border-b last:border-b-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {user.firstname || user.first_name} {user.lastname || user.last_name}
                                        </span>
                                        <span className="text-sm text-gray-500">{user.email}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No queue users found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Manage Users Tab Content */}
            {activeTab === 'manage' && (
                <>
                    {/* User Selection Section */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Select User</h2>
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto border rounded-lg">
                                {filteredUsers.map(user => {
                                    const userId = parseInt(user.user_id, 10);
                                    const isSelected = selectedUsers.includes(userId);
                                    return (
                                        <div
                                            key={userId}
                                            className={`p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                                                isSelected ? 'bg-pink-50' : ''
                                            }`}
                                            onClick={() => handleUserSelection(userId, !isSelected)}
                                        >
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="border-gray-300 text-pink-600 focus:ring-pink-500"
                                            />
                                            <span>
                                                {user.firstname || user.first_name} {user.lastname || user.last_name}
                                                <span className="text-gray-500 text-sm ml-2">({user.email})</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {selectedUsers.length === 1 && (
                        <>
                            {/* Current Licenses Section - Moved to top */}
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold mb-4">Current Licenses</h2>
                                <div className="p-4 border rounded-lg bg-white">
                                    {isLoadingLicenses ? (
                                        <div className="flex justify-center items-center p-4">
                                            <span className="text-sm text-gray-500">Loading licenses...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {licenseError && (
                                                <div className="text-sm text-red-500 mb-4">
                                                    {licenseError}
                                                </div>
                                            )}
                                            {selectedUsers.map(userId => {
                                                const userLicenses = currentUserLicenses[userId] || [];
                                                const user = users.find(u => u.user_id === userId);
                                                return (
                                                    <div key={userId} className="space-y-4">
                                                        {Array.isArray(userLicenses) && userLicenses.length > 0 ? (
                                                            <div>
                                                                <div className="mb-2 text-sm font-medium text-gray-700">Assigned licenses:</div>
                                                                {userLicenses.map(license => {
                                                                    const moduleId = license.module_id;
                                                                    const licenseTypeId = license.license_type_id;
                                                                    
                                                                    const module = modules?.find(m => 
                                                                        m.module_id === moduleId || 
                                                                        m.module_name.toLowerCase() === moduleId.toLowerCase()
                                                                    );
                                                                    
                                                                    const licenseType = module?.license_type?.find(lt => 
                                                                        lt.type_id === licenseTypeId || 
                                                                        lt.type === licenseTypeId
                                                                    );
                                                                    
                                                                    return (
                                                                        <div key={`${moduleId}-${licenseTypeId}`} 
                                                                             className="flex items-center gap-2 p-2 mb-1 bg-pink-50 border border-pink-200 rounded-md text-sm">
                                                                            <span>
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </span>
                                                                            <span className="font-medium text-gray-700">
                                                                                {module?.module_name || moduleId || 'Unknown Module'}:
                                                                            </span>
                                                                            <span className="text-gray-600">
                                                                                {licenseType?.type || licenseTypeId || 'Unknown License Type'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 p-2 bg-gray-50 border border-gray-200 rounded-md">
                                                                No licenses currently assigned to this user. You can assign licenses below.
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Current Permissions Section */}
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold mb-4">Current Permissions</h2>
                                <div className="flex flex-col gap-4">
                                    {(() => {
                                        const userId = selectedUsers[0];
                                        const userPerms = userPermissions[userId] || [];
                                        
                                        console.log('Current permissions for user:', userId, userPerms);
                                        
                                        // If user has no permissions, show message
                                        if (userPerms.length === 0) {
                                            return (
                                                <div className="p-4 border rounded-lg bg-gray-50 text-gray-600">
                                                    No permissions are currently assigned to this user.
                                                </div>
                                            );
                                        }

                                        // If user has permissions, show them with remove checkboxes
                                        const permissionSections = permissions
                                            .map((section) => {
                                                // Filter permissions that the user has
                                                const sectionPermissions = section.permissionGroups
                                                    .flatMap(group => group.permissions || [])
                                                    .filter(permission => userPerms.includes(parseInt(permission.permission_id, 10)));

                                                console.log(`Section ${section.name} has ${sectionPermissions.length} permissions for user`);
                                                if (section.module_id === MODULES.PROCESS_MANAGEMENT.id) {
                                                    console.log('Process permissions found:', sectionPermissions);
                                                }

                                                if (sectionPermissions.length === 0) return null;

                                                return (
                                                    <div key={`module-permissions-${section.module_id}`} className="p-4 border rounded-lg bg-gray-50">
                                                        <h3 className="text-lg font-medium mb-4">{section.name} Permissions</h3>
                                                        <div className="mb-4 flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={sectionPermissions.every(permission => 
                                                                    permissionsToRemove.includes(parseInt(permission.permission_id, 10))
                                                                )}
                                                                onChange={() => handleSelectAllPermissionsForRemoval(sectionPermissions)}
                                                                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                                id={`select-all-remove-${section.module_id}`}
                                                            />
                                                            <label 
                                                                htmlFor={`select-all-remove-${section.module_id}`} 
                                                                className="text-sm font-medium text-red-600"
                                                            >
                                                                Select All Permissions to Remove
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {sectionPermissions.map((permission) => {
                                                                const permissionId = parseInt(permission.permission_id, 10);
                                                                const isChecked = permissionsToRemove.includes(permissionId);
                                                                
                                                                return (
                                                                    <div key={`permission-${permissionId}`} className="flex items-start gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => handlePermissionChangeForRemoval(permissionId)}
                                                                            className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                                            id={`remove-permission-${permissionId}`}
                                                                        />
                                                                        <label htmlFor={`remove-permission-${permissionId}`} className="text-sm">
                                                                            <div className="font-medium">{permission.name}</div>
                                                                            {permission.description && (
                                                                                <div className="text-gray-500">{permission.description}</div>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                            .filter(Boolean);

                                        return permissionSections;
                                    })()}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="my-8 border-t border-gray-200"></div>

                            {/* New License Assignment Section */}
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold mb-4">Assign New License & Permissions</h2>
                                <div className="w-full">
                                    <div className="p-4 border rounded-lg bg-white">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium">Licenses</h3>
                                        </div>
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
                                                            const isSelected = selectedModules.includes(module.module_id) && selectedLicenseTypes[module.module_id] === type.type_id;
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
                            </div>

                            {/* Permissions Section - After licenses */}
                            {selectedModules.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-lg font-semibold mb-4">Permissions</h2>
                                    <div className="flex flex-col gap-4">
                                        {permissions
                                            .filter(section => selectedModules.includes(section.module_id))
                                            .map((section, sectionIndex) => {
                                                console.log(`Rendering permissions section for ${section.name} with ${section.permissionGroups.length} groups`);
                                                
                                                return (
                                                    <div key={`module-permissions-${section.module_id}-${sectionIndex}`} className="p-4 border rounded-lg bg-gray-50">
                                                        <h3 className="text-lg font-medium mb-4">{section.name} Permissions</h3>
                                                        <div className="space-y-6">
                                                            {section.permissionGroups && section.permissionGroups.length > 0 ? (
                                                                <div className="space-y-6">
                                                                    {section.permissionGroups.map((group, groupIndex) => {
                                                                        const allPermissions = group.permissions || [];
                                                                        
                                                                        console.log(`Group ${group.title} has ${allPermissions.length} permissions`);
                                                                        
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
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    onClick={handleClearSelection}
                                >
                                    Clear Selection
                                </button>
                                {permissionsToRemove.length > 0 && (
                                <button
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleRemovePermissions}
                                        disabled={selectedUsers.length === 0}
                                    >
                                        Remove Selected Permissions
                                </button>
                                )}
                                <button
                                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleAssignLicense}
                                    disabled={!selectedModules.length || !Object.keys(selectedLicenseTypes).length || selectedUsers.length === 0 || isAssigningLicense}
                                >
                                    {isAssigningLicense ? 'Assigning...' : 'Assign License & Permissions'}
                                </button>
                            </div>
                        </>
                    )}
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