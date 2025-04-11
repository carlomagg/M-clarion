import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { useQuery } from "@tanstack/react-query";
import { permissionsOptions } from "../../../../../queries/permissions-queries.js";
import { modulesOptions } from "../../../../../queries/modules/modules-queries.js";
import { licensesOptions } from "../../../../../queries/license-queries.js";
import { MODULES } from "../../../../../utils/consts";

const LicenseRadio = React.memo(({ moduleId, licenseTypeId, checked, onChange }) => {
    return (
        <input
            type="radio"
            name={`license-${moduleId}`}
            checked={checked}
            onChange={onChange}
            className="mr-2 rounded-full border-gray-300 text-pink-600 focus:ring-pink-500"
        />
    );
});

function AssignLicenseAndPermissions({ formData, setFormData, onNext, onBack, userData = null }) {
    const [permissions, setPermissions] = useState([]);
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());
    const [licenseUsage, setLicenseUsage] = useState({});
    
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

    const areAllPermissionsSelected = useCallback((permissions) => {
        return permissions.every(permission => 
            formData.user_permissions.permission_ids.includes(parseInt(permission.permission_id, 10))
        );
    }, [formData.user_permissions.permission_ids]);

    const handleSelectAllPermissions = useCallback((permissions) => {
        setFormData(prev => {
            const currentPermissionIds = new Set(prev.user_permissions.permission_ids);
            const allSelected = areAllPermissionsSelected(permissions);

            permissions.forEach(permission => {
                const permissionId = parseInt(permission.permission_id, 10);
                if (allSelected) {
                    currentPermissionIds.delete(permissionId);
                } else {
                    currentPermissionIds.add(permissionId);
                }
            });

            return {
                ...prev,
                user_permissions: {
                    ...prev.user_permissions,
                    permission_ids: Array.from(currentPermissionIds)
                }
            };
        });
    }, [areAllPermissionsSelected]);

    const handlePermissionChange = useCallback((permissionId) => {
        setFormData(prev => {
            const currentPermissionIds = new Set(prev.user_permissions.permission_ids);
            
            if (currentPermissionIds.has(permissionId)) {
                currentPermissionIds.delete(permissionId);
            } else {
                currentPermissionIds.add(permissionId);
            }

            return {
                ...prev,
                user_permissions: {
                    ...prev.user_permissions,
                    permission_ids: Array.from(currentPermissionIds)
                }
            };
        });
    }, []);

    // Initialize form data with user data when in edit mode
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                user_licenses: [...(userData.licenses || [])],
                user_permissions: {
                    permission_ids: [...(userData.permissions?.map(p => p.permission_id) || [])]
                }
            }));
        }
    }, [userData, setFormData]);

    // Fetch permissions and modules using react-query
    const { data: apiPermissions, isLoading: permissionsLoading } = useQuery(permissionsOptions());
    const { data: modules, isLoading: modulesLoading } = useQuery(modulesOptions());

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
                            permissions: riskPermissions.map(p => ({
                                ...p,
                                permission_id: parseInt(p.id || p.permission_id, 10),
                                name: p.name,
                                description: p.description
                            }))
                        },
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions.map(p => ({
                                ...p,
                                permission_id: parseInt(p.id || p.permission_id, 10),
                                name: p.name,
                                description: p.description
                            }))
                        }
                    ];
                } else if (moduleId === MODULES.PROCESS_MANAGEMENT.id) {
                    modulePermissions = [
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions.map(p => ({
                                ...p,
                                permission_id: parseInt(p.id || p.permission_id, 10),
                                name: p.name,
                                description: p.description
                            }))
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
    }, [apiPermissions, modules]);

    // Initialize license usage when modules data is loaded
    useEffect(() => {
        if (modules) {
            const initialUsage = {};
            modules.forEach(module => {
                initialUsage[module.module_id] = {
                    total: module.license_usage,
                    types: {}
                };
                module.license_type.forEach(type => {
                    // Store the initial values separately
                    const [initialUsed, total] = type.usage.split('/').map(Number);
                    initialUsage[module.module_id].types[type.type_id] = {
                        initialUsed,  // Keep track of initial value
                        used: initialUsed,
                        total
                    };
                });
            });
            setLicenseUsage(initialUsage);
        }
    }, [modules]);

    const handleLicenseChange = useCallback((moduleId, licenseTypeId) => {
        moduleId = parseInt(moduleId, 10);
        licenseTypeId = parseInt(licenseTypeId, 10);
        
        // Check if the license is currently selected
        const isCurrentlySelected = formData.user_licenses.some(
            license => license.module_id === moduleId && license.license_type_id === licenseTypeId
        );
        
        // Create a new form data object with the updated license selection
        const newFormData = { ...formData };
        
        // Get all licenses except those for the current module
        const otherModuleLicenses = newFormData.user_licenses.filter(
            license => license.module_id !== moduleId
        );

        // Update form data
        newFormData.user_licenses = isCurrentlySelected 
            ? otherModuleLicenses 
            : [...otherModuleLicenses, { module_id: moduleId, license_type_id: licenseTypeId }];
        
        // Update license usage
        setLicenseUsage(prev => {
            const newUsage = { ...prev };
            if (newUsage[moduleId] && newUsage[moduleId].types[licenseTypeId]) {
                if (isCurrentlySelected) {
                    // When deselecting, return to initial value
                    newUsage[moduleId].types[licenseTypeId].used = 
                        newUsage[moduleId].types[licenseTypeId].initialUsed;
                } else {
                    // When selecting, increment by 1 from initial value
                    newUsage[moduleId].types[licenseTypeId].used = 
                        newUsage[moduleId].types[licenseTypeId].initialUsed + 1;
                }
            }
            return newUsage;
        });

        setFormData(newFormData);
    }, [formData]);

    // Cache module selection status
    const selectedModules = useMemo(() => {
        const selected = new Set();
        formData.user_licenses.forEach(license => {
            selected.add(license.module_id);
        });
        return selected;
    }, [formData.user_licenses]);

    const isModuleSelected = useCallback((moduleId) => {
        moduleId = parseInt(moduleId, 10);
        return selectedModules.has(moduleId);
    }, [selectedModules]);

    const getSelectedLicenseType = useCallback((moduleId) => {
        moduleId = parseInt(moduleId, 10);
        const license = formData.user_licenses.find(
            license => license.module_id === moduleId
        );
        return license ? license.license_type_id : null;
    }, [formData.user_licenses]);

    // Get unique license types from all modules
    const licenseTypes = useMemo(() => {
        if (!modules) return [];
        
        const licenseTypesMap = new Map();
        modules.forEach(module => {
            module.license_type.forEach(lt => {
                if (!licenseTypesMap.has(lt.type_id)) {
                    licenseTypesMap.set(lt.type_id, lt);
                }
            });
        });
        return Array.from(licenseTypesMap.values());
    }, [modules]);

    if (permissionsLoading || modulesLoading) {
        return <div className="flex justify-center items-center p-4">Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* License Section */}
            <div className="p-4 border rounded-lg bg-white">
                <h3 className="text-lg font-medium mb-4">Licenses</h3>
                <div className="space-y-4">
                    {modules?.map((module, moduleIndex) => (
                        <div key={`module-license-${module.module_id}-${moduleIndex}`} className="border-b pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium">{module.module_name}</div>
                                <div className="text-sm text-gray-500">
                                    Total: {licenseUsage[module.module_id]?.total || module.license_usage}
                                </div>
                            </div>
                            
                            {module.license_type.map((type) => {
                                const isSelected = formData.user_licenses.some(license => 
                                    license.module_id === parseInt(module.module_id, 10) && 
                                    license.license_type_id === parseInt(type.type_id, 10)
                                );
                                
                                const usage = licenseUsage[module.module_id]?.types[type.type_id] || {};
                                const used = usage.used || usage.initialUsed || 0;
                                const total = usage.total || parseInt(type.usage.split('/')[1], 10);
                                const isDisabled = !isSelected && used >= total;
                                
                                return (
                                    <div key={`license-type-${module.module_id}-${type.type_id}`} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name={`license-${module.module_id}`}
                                            checked={isSelected}
                                            onChange={() => handleLicenseChange(module.module_id, type.type_id)}
                                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                            disabled={isDisabled}
                                        />
                                        <span className="text-sm">
                                            {type.type} ({used}/{total})
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Permissions Section */}
            <div className="flex flex-col gap-4">
                {permissions.map((section, sectionIndex) => {
                    const moduleSelected = isModuleSelected(section.module_id);
                    if (!moduleSelected) return null;

                    return (
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
                                                                    const isChecked = formData.user_permissions.permission_ids.includes(permissionId);
                                                                    
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

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-4">
                <button 
                    onClick={onBack}
                    className="flex-1 py-3 text-black font-medium bg-[#E0E0E0] hover:bg-[#D3D3D3] rounded-lg text-center"
                >
                    Back
                </button>
                <button 
                    onClick={onNext}
                    className="flex-1 py-3 text-white font-medium bg-pink-600 hover:bg-pink-700 rounded-lg text-center"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default AssignLicenseAndPermissions;
