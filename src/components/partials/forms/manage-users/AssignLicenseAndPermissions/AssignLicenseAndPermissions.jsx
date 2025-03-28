import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { useQuery } from "@tanstack/react-query";
import { permissionsOptions } from "../../../../../queries/permissions/permissions-queries.js";
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

function AssignLicenseAndPermissions({ formData, setFormData, onNext, onBack }) {
    const [permissions, setPermissions] = useState([]);

    // Fetch permissions and modules using react-query
    const { data: apiPermissions, isLoading: permissionsLoading } = useQuery(permissionsOptions());
    const { data: modules, isLoading: modulesLoading } = useQuery(modulesOptions());

    // Debug logs for API responses
    useEffect(() => {
        if (modules) {
            console.log('Modules data:', modules);
        }
    }, [modules]);

    useEffect(() => {
        if (apiPermissions) {
            console.log('Raw API Permissions:', apiPermissions);
        }
    }, [apiPermissions]);

    // Initialize permissions when data is loaded
    useEffect(() => {
        if (apiPermissions && modules) {
            console.log('Raw API Permissions:', apiPermissions);
            console.log('MODULES:', MODULES);
            console.log('Current modules:', modules);
            
            // Create permissions array dynamically based on modules
            const newPermissions = modules.map(module => {
                const moduleId = parseInt(module.module_id, 10);
                console.log(`Processing module: ${module.module_name} (ID: ${moduleId})`);
                
                let modulePermissions = [];
                const userPermissions = apiPermissions.user || [];

                // Map the module to the correct type based on MODULES constant
                if (moduleId === MODULES.RISK_MANAGEMENT.id) {
                    // For Risk Management, include risk permissions and user permissions
                    const riskPermissions = apiPermissions.risk || [];
                    modulePermissions = [
                        {
                            title: "Core Permissions",
                            permissions: riskPermissions
                        },
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions
                        }
                    ];
                } else if (moduleId === MODULES.PROCESS_MANAGEMENT.id) {
                    // For Process Management, only include user permissions for now
                    modulePermissions = [
                        {
                            title: "User Management Permissions",
                            permissions: userPermissions
                        }
                    ];
                }

                const section = {
                    id: `module-permissions-${moduleId}`,
                    name: `${module.module_name} Module Permissions`,
                    module_id: moduleId,
                    permissionGroups: modulePermissions,
                    type: moduleId === MODULES.RISK_MANAGEMENT.id ? 'risk' : 'user'
                };
                console.log('Created section:', section);
                return section;
            });
            
            console.log('Final permissions structure:', newPermissions);
            setPermissions(newPermissions);
        }
    }, [apiPermissions, modules]);

    const handleLicenseChange = useCallback((moduleId, licenseTypeId) => {
        moduleId = parseInt(moduleId, 10);
        licenseTypeId = parseInt(licenseTypeId, 10);

        console.log('Handling license change:', { moduleId, licenseTypeId });

        setFormData(draft => {
            // Remove all licenses first
            draft.user_licenses = [];
            
            // Add only the selected license
            draft.user_licenses.push({
                module_id: moduleId,
                license_type_id: licenseTypeId
            });

            // Clear permissions that don't belong to the selected module
            const currentModulePermissions = permissions.find(section => section.module_id === moduleId);
            console.log('Current module permissions:', currentModulePermissions);

            if (currentModulePermissions) {
                const validPermissionIds = currentModulePermissions.permissionGroups.reduce((acc, group) => acc.concat(group.permissions.map(p => p.permission_id)), []);
                console.log('Valid permission IDs:', validPermissionIds);
                draft.user_permissions.permission_ids = draft.user_permissions.permission_ids.filter(id => 
                    validPermissionIds.includes(id)
                );
            }
        });
    }, [setFormData, permissions]);

    const handlePermissionChange = useCallback((permissionId) => {
        const numericId = parseInt(permissionId, 10);
        console.log('Handling permission change:', { permissionId: numericId });
        
        setFormData(draft => {
            const permissions = draft.user_permissions.permission_ids;
            const index = permissions.indexOf(numericId);
            
            if (index === -1) {
                permissions.push(numericId);
            } else {
                permissions.splice(index, 1);
            }
        });
    }, [setFormData]);

    const handleSelectAllPermissions = useCallback((permissions) => {
        const permissionIds = permissions.map(p => parseInt(p.permission_id, 10));
        
        setFormData(draft => {
            const currentPermissions = new Set(draft.user_permissions.permission_ids);
            const allSelected = permissionIds.every(id => currentPermissions.has(id));
            
            if (allSelected) {
                // Deselect all permissions for this module
                draft.user_permissions.permission_ids = draft.user_permissions.permission_ids
                    .filter(id => !permissionIds.includes(id));
            } else {
                // Select all permissions for this module
                const newPermissions = new Set([...draft.user_permissions.permission_ids]);
                permissionIds.forEach(id => newPermissions.add(id));
                draft.user_permissions.permission_ids = Array.from(newPermissions);
            }
        });
    }, [setFormData]);

    const areAllPermissionsSelected = useCallback((permissions) => {
        const permissionIds = permissions.map(p => parseInt(p.permission_id, 10));
        return permissionIds.every(id => formData.user_permissions.permission_ids.includes(id));
    }, [formData.user_permissions.permission_ids]);

    const isModuleSelected = useCallback((moduleId) => {
        moduleId = parseInt(moduleId, 10);
        const isSelected = formData.user_licenses.some(license => license.module_id === moduleId);
        console.log(`Checking if module ${moduleId} is selected:`, isSelected, 'Current licenses:', formData.user_licenses);
        return isSelected;
    }, [formData.user_licenses]);

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
                <h3 className="text-lg font-medium mb-4">Module Licenses</h3>
                <div className="space-y-4">
                    {modules?.map((module, moduleIndex) => (
                        <div key={`module-license-${module.module_id}-${moduleIndex}`} className="border-b pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium">{module.module_name}</div>
                                <div className="text-sm text-gray-500">Total: {module.license_usage}</div>
                            </div>
                            <div className="flex gap-6">
                                {module.license_type.map((type) => {
                                    const isSelected = getSelectedLicenseType(module.module_id) === type.type_id;
                                    return (
                                        <div key={`license-type-${module.module_id}-${type.type_id}`} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`license-${module.module_id}`}
                                                checked={isSelected}
                                                onChange={() => handleLicenseChange(module.module_id, type.type_id)}
                                                className="text-pink-600 focus:ring-pink-500"
                                            />
                                            <span className="text-sm">
                                                {type.type} ({type.usage})
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Permissions Section */}
            <div className="flex flex-col gap-4">
                {permissions.map((section, sectionIndex) => {
                    // Only show permissions for selected modules
                    const moduleSelected = isModuleSelected(section.module_id);
                    console.log(`Checking section visibility for ${section.name}:`, {
                        moduleId: section.module_id,
                        isSelected: moduleSelected,
                        permissions: section.permissionGroups
                    });

                    if (!moduleSelected) {
                        return null;
                    }

                    return (
                        <div key={`module-permissions-${section.module_id}-${sectionIndex}`} className="p-4 border rounded-lg bg-white">
                            <h3 className="text-lg font-medium mb-4">{section.name}</h3>
                            {section.permissionGroups && section.permissionGroups.length > 0 ? (
                                <div className="space-y-6">
                                    {section.permissionGroups.map((group, groupIndex) => {
                                        const allPermissions = group.permissions || [];
                                        if (allPermissions.length === 0) return null;

                                        return (
                                            <div key={`permission-group-${groupIndex}`} className="space-y-4">
                                                <div className="border-b pb-2">
                                                    <h4 className="text-md font-medium bg-gray-100 p-2 rounded">{group.title}</h4>
                                                </div>
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
                                                        className="text-sm font-medium"
                                                    >
                                                        Select All {group.title}
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
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-gray-500">No permissions available for this module.</div>
                            )}
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
