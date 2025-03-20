import React, { useState } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useQuery } from '@tanstack/react-query';
import { permissionsOptions } from '../../../../../queries/permissions/permissions-queries';
import { MODULES } from '../../../../../utils/consts';
import styles from './AddNewUserReview.module.css';

// License types mapping
const LICENSE_TYPES = {
    1: 'Named',
    2: 'Read-only'
};

function AddNewUserReview({ formData, onBack, onSubmit, isEditMode, supervisors, subsidiaries }) {
    const [expandedSections, setExpandedSections] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Fetch permissions from API
    const { data: apiPermissions, isLoading: permissionsLoading } = useQuery(permissionsOptions());

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Get all licenses for a module
    const getModuleLicenses = (moduleId) => {
        if (!formData.user_licenses) return [];
        
        return formData.user_licenses
            .filter(license => parseInt(license.module_id) === moduleId)
            .map(license => ({
                ...license,
                module_id: parseInt(license.module_id),
                license_type_id: parseInt(license.license_type_id)
            }))
            .filter(license => !isNaN(license.module_id) && !isNaN(license.license_type_id));
    };

    // Check if module has any licenses
    const hasModuleLicenses = (moduleId) => {
        if (!formData.user_licenses) return false;
        
        return formData.user_licenses.some(license => 
            parseInt(license.module_id) === moduleId
        );
    };

    // Get module permissions
    const getModulePermissions = (moduleId) => {
        if (!apiPermissions) return [];

        try {
            const { user: userPermissions = [], risk: riskPermissions = [] } = apiPermissions;
            const module = Object.values(MODULES).find(m => m.id === moduleId);
            
            if (!module) return [];

            // Combine permissions based on module type
            const allPermissions = module.key === 'risk'
                ? [...userPermissions, ...riskPermissions]
                : userPermissions;

            return allPermissions.map(p => ({
                ...p,
                permission_id: parseInt(p.permission_id)
            })).filter(p => p.permission_id && !isNaN(p.permission_id));
        } catch (error) {
            console.error('Error processing module permissions:', error);
            return [];
        }
    };

    // Get selected permissions for a module
    const getSelectedModulePermissions = (moduleId) => {
        if (!formData.user_permissions?.permission_ids) return [];
        
        const modulePermissions = getModulePermissions(moduleId);
        const selectedIds = formData.user_permissions.permission_ids
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

        return modulePermissions.filter(
            permission => selectedIds.includes(permission.permission_id)
        );
    };

    if (permissionsLoading) {
        return <div className="flex justify-center items-center p-4">Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* User Details */}
            <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium mb-4">User Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="text-sm">{formData.user_details.first_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="text-sm">{formData.user_details.last_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm">{formData.user_details.email_address}</p>
                    </div>
                    {(!isEditMode || formData.user_details.password) && (
                        <div>
                            <p className="text-sm text-gray-500">Password</p>
                            <div className="flex items-center">
                                <p className="text-sm">
                                    {isEditMode ? "Will be updated" : (showPassword ? formData.user_details.password : "••••••••")}
                                </p>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                                </button>
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-500">Subsidiary</p>
                        <p className="text-sm">
                            {subsidiaries?.subsidiaries?.find(s => s.id === formData.user_details.subsidiary_id)?.name || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Supervisor</p>
                        <p className="text-sm">
                            {supervisors?.find(s => s.user_id === parseInt(formData.user_details.supervisor_id))?.firstname || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Password Change Required</p>
                        <p className="text-sm">{formData.user_details.require_password_change ? "Yes" : "No"}</p>
                    </div>
                </div>
            </div>

            {/* Licenses */}
            <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium mb-2 bg-gray-100 p-2 rounded">Assigned Licenses</h3>
                <div className="space-y-2">
                    {Object.values(MODULES).map(module => {
                        const moduleLicenses = getModuleLicenses(module.id);
                        return moduleLicenses.map((license, index) => (
                            <div key={`${module.id}-${license.license_type_id}-${index}`} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">{module.name}:</span>
                                <span>{LICENSE_TYPES[license.license_type_id]} License</span>
                            </div>
                        ));
                    })}
                    {!formData.user_licenses?.length && (
                        <p className="text-sm text-gray-500">No licenses assigned</p>
                    )}
                </div>
            </div>

            {/* Permissions */}
            <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium mb-2 bg-gray-100 p-2 rounded">Assigned Permissions</h3>
                <div className="space-y-2">
                    {formData.user_permissions?.set_as_admin && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-pink-600">Administrator Access</p>
                            <p className="text-xs text-gray-500">Has full access to all features and functions</p>
                        </div>
                    )}
                    {formData.user_permissions?.permission_ids?.length > 0 ? (
                        Object.values(MODULES)
                            .filter(module => hasModuleLicenses(module.id))
                            .map(module => {
                                const modulePermissions = getSelectedModulePermissions(module.id);
                                if (modulePermissions.length === 0) return null;

                                return (
                                    <div key={module.id} className="mt-2">
                                        <div 
                                            className="flex items-center cursor-pointer"
                                            onClick={() => toggleSection(module.id)}
                                        >
                                            {expandedSections[module.id] ? 
                                                <IoIosArrowDown className="text-gray-500" /> : 
                                                <IoIosArrowForward className="text-gray-500" />
                                            }
                                            <p className="text-sm font-medium ml-1">{module.name}</p>
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({modulePermissions.length} permissions)
                                            </span>
                                        </div>
                                        {expandedSections[module.id] && (
                                            <div className="ml-6 mt-2 space-y-1">
                                                {modulePermissions.map(perm => (
                                                    <div key={perm.permission_id} className="flex items-center text-sm">
                                                        <span className="w-4 h-4 mr-2 bg-green-100 rounded-full flex items-center justify-center">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        </span>
                                                        <span>
                                                            {perm.name}
                                                            {perm.type === 'risk' && (
                                                                <span className="ml-1 text-xs text-pink-600">(Risk)</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                    ) : (
                        <p className="text-sm text-gray-500">No permissions assigned</p>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
                <button 
                    onClick={onBack}
                    className="flex-1 py-3 text-black font-medium bg-[#E0E0E0] hover:bg-[#D3D3D3] rounded-lg text-center"
                >
                    Back
                </button>
                <button 
                    onClick={onSubmit}
                    className="flex-1 py-3 text-white font-medium bg-[#E91E63] hover:bg-[#D81B60] rounded-lg text-center"
                >
                    {isEditMode ? "Update User" : "Create User"}
                </button>
            </div>
        </div>
    );
}

export default AddNewUserReview;
