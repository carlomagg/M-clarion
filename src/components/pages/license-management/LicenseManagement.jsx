import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersOptions } from '../../../queries/users-queries';
import { licensesOptions, useAssignLicense } from '../../../queries/license-queries';

const LICENSE_TYPES = [
    { value: 'read_only', label: 'Read Only' },
    { value: 'full_access', label: 'Full Access' }
];

const MODULES = [
    { value: 'risk', label: 'Risk Management' },
    { value: 'processes', label: 'Process Management' }
];

function LicenseManagement() {
    const queryClient = useQueryClient();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedModule, setSelectedModule] = useState(MODULES[0].value);
    const [licenseType, setLicenseType] = useState(LICENSE_TYPES[0].value);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users using real API
    const { data: users = [], isLoading: usersLoading } = useQuery(usersOptions());

    // Fetch current licenses using real API
    const { data: licenses = [], isLoading: licensesLoading } = useQuery(licensesOptions());

    const assignLicenseMutation = useAssignLicense({
        onSuccess: () => {
            queryClient.invalidateQueries(['licenses']);
            setSelectedUsers([]);
            setSearchTerm('');
        },
        onError: (error) => {
            console.error('Failed to assign license:', error);
        }
    });

    const handleAssignLicense = () => {
        if (selectedUsers.length === 0) return;

        selectedUsers.forEach(userId => {
            assignLicenseMutation.mutate({
                userId,
                licenseData: {
                    module_name: selectedModule,
                    license_type: licenseType
                }
            });
        });
    };

    const filteredUsers = users.filter(user => 
        `${user.first_name} ${user.last_name} ${user.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (usersLoading || licensesLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Calculate available licenses for each module/type combination
    const getAvailableLicenses = (module, type) => {
        const license = licenses.find(l => 
            l.module_name === module && 
            l.license_type === type
        );
        return license ? (license.total_count - license.used_count) : 0;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-[14px] font-bold text-gray-900">License Management</h1>
                <p className="mt-2 text-[12px] text-gray-600">Assign and manage user licenses for different modules</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* License Assignment Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-[12px] font-semibold mb-6">Assign New Licenses</h2>
                    
                    <div className="space-y-6">
                        {/* Search Users */}
                        <div>
                            <label className="block text-[12px] font-normal text-gray-700 mb-2">
                                Search Users
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px]"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* User Selection */}
                        <div>
                            <label className="block text-[12px] font-normal text-gray-700 mb-2">
                                Select Users
                            </label>
                            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.user_id}
                                        className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mr-3"
                                            checked={selectedUsers.includes(user.user_id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers([...selectedUsers, user.user_id]);
                                                } else {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                                                }
                                            }}
                                        />
                                        <div>
                                            <div className="text-[12px] font-normal">{`${user.first_name} ${user.last_name}`}</div>
                                            <div className="text-[12px] text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Module Selection */}
                        <div>
                            <label className="block text-[12px] font-normal text-gray-700 mb-2">
                                Select Module
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px]"
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                            >
                                {MODULES.map(module => (
                                    <option 
                                        key={module.value} 
                                        value={module.value}
                                        disabled={getAvailableLicenses(module.value, licenseType) <= 0}
                                        className="text-[12px]"
                                    >
                                        {module.label} ({getAvailableLicenses(module.value, licenseType)} available)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* License Type Selection */}
                        <div>
                            <label className="block text-[12px] font-normal text-gray-700 mb-2">
                                License Type
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px]"
                                value={licenseType}
                                onChange={(e) => setLicenseType(e.target.value)}
                            >
                                {LICENSE_TYPES.map(type => (
                                    <option 
                                        key={type.value} 
                                        value={type.value}
                                        disabled={getAvailableLicenses(selectedModule, type.value) <= 0}
                                        className="text-[12px]"
                                    >
                                        {type.label} ({getAvailableLicenses(selectedModule, type.value)} available)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assign Button */}
                        <button
                            onClick={handleAssignLicense}
                            disabled={selectedUsers.length === 0 || !selectedModule || !licenseType}
                            className={`w-full py-2 px-4 rounded-md text-[12px] ${
                                selectedUsers.length === 0 || !selectedModule || !licenseType
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            Assign Licenses
                        </button>
                    </div>
                </div>

                {/* Current Licenses Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-[12px] font-semibold mb-6">Current Licenses</h2>
                    <div className="space-y-6">
                        {MODULES.map(module => (
                            <div key={module.value} className="border-b pb-4 last:border-b-0">
                                <h3 className="text-[12px] font-normal mb-3">{module.label}</h3>
                                <div className="space-y-2">
                                    {LICENSE_TYPES.map(type => {
                                        const available = getAvailableLicenses(module.value, type.value);
                                        const total = licenses.find(l => 
                                            l.module_name === module.value && 
                                            l.license_type === type.value
                                        )?.total_count || 0;
                                        const used = total - available;
                                        
                                        return (
                                            <div key={type.value} className="flex justify-between text-[12px]">
                                                <span>{type.label}:</span>
                                                <span>{used} / {total} used</span>
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
    );
}

export default LicenseManagement;