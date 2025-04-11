import React from 'react';

const LICENSE_TYPES = [
    { value: 'read_only', label: 'Read Only' },
    { value: 'full_access', label: 'Full Access' }
];

const MODULES = [
    { value: 'risk', label: 'Risk Management' },
    { value: 'processes', label: 'Process Management' }
];

function AssignUserLicenseForm({ formData, setFormData, availableLicenses = [], onNext, onBack }) {
    const handleModuleChange = (module) => {
        setFormData(draft => {
            draft.license_details.module_name = module;
        });
    };

    const handleLicenseTypeChange = (type) => {
        setFormData(draft => {
            draft.license_details.license_type = type;
        });
    };

    // Calculate available licenses for each module and type
    const getLicenseCount = (module, type) => {
        const license = availableLicenses?.find(l => 
            l.module_name === module && 
            l.license_type === type
        );
        return license ? (license.total_count - license.used_count) : 0;
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-[12px] font-normal">Assign License</h3>
                <p className="text-[12px] text-gray-600">Select a module and license type to assign to the user</p>
            </div>

            <div className="space-y-6">
                {/* Module Selection */}
                <div>
                    <label className="block text-[12px] font-normal text-gray-700 mb-2">
                        Select Module
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px]"
                        value={formData.license_details.module_name}
                        onChange={(e) => handleModuleChange(e.target.value)}
                    >
                        <option value="" className="text-[12px]">Select a module...</option>
                        {MODULES.map(module => (
                            <option 
                                key={module.value} 
                                value={module.value}
                                disabled={getLicenseCount(module.value, formData.license_details.license_type) <= 0}
                                className="text-[12px]"
                            >
                                {module.label} ({getLicenseCount(module.value, formData.license_details.license_type)} available)
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
                        value={formData.license_details.license_type}
                        onChange={(e) => handleLicenseTypeChange(e.target.value)}
                    >
                        <option value="" className="text-[12px]">Select a license type...</option>
                        {LICENSE_TYPES.map(type => (
                            <option 
                                key={type.value} 
                                value={type.value}
                                disabled={getLicenseCount(formData.license_details.module_name, type.value) <= 0}
                                className="text-[12px]"
                            >
                                {type.label} ({getLicenseCount(formData.license_details.module_name, type.value)} available)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='flex items-center justify-between mt-6 gap-4'>
                <button 
                    type="button" 
                    onClick={onBack}
                    className="flex-1 py-3 text-black font-medium bg-[#E0E0E0] hover:bg-[#D3D3D3] rounded-lg text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>
                <button 
                    type="button"
                    onClick={onNext}
                    disabled={!formData.license_details.module_name || !formData.license_details.license_type}
                    className="flex-1 py-3 text-white font-medium bg-[#E91E63] hover:bg-[#D81B60] rounded-lg text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default AssignUserLicenseForm;
