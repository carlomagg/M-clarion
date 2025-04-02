import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { supervisorsOptions, subsidiariesOptions, usersOptions, fetchNonLicensedUsers, userSourcesOptions } from '../../../../../queries/users-queries';
import './AddUserDetailsForm.css';

function AddUserDetailsForm({
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    onNext,
    onCancel,
    isEditMode,
    supervisors,
    subsidiaries
}) {
    const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
    const [supervisorDropdownOpen, setSupervisorDropdownOpen] = useState(false);
    const [queueSearchTerm, setQueueSearchTerm] = useState('');
    const [showDomainWarning, setShowDomainWarning] = useState(false);

    // Fetch sources from API
    const { data: sources = [], isLoading: isLoadingSources } = useQuery(userSourcesOptions());
    
    useEffect(() => {
        // Log sources data when it changes
        console.log('Sources data:', sources);
    }, [sources]);

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

    // Format sources for dropdown
    const sourceItems = sources.map(source => ({
        id: source.id,
        text: source.name
    }));

    function handleChange(event) {
        setValidationErrors({
            ...validationErrors,
            [event.target.name]: null
        })

        setFormData(draft => {
            let new_value;

            if (event.target.type === 'checkbox') {
                new_value = !draft['user_details'][event.target.name];
            } else if (event.target.name === 'subsidiary_id') {
                const rawValue = event.target.value?.replace('sub_', '');
                new_value = rawValue ? parseInt(rawValue, 10) : null;
            } else if (event.target.name === 'supervisor_id') {
                const rawValue = event.target.value?.replace('sup_', '');
                new_value = rawValue || null;
            } else if (event.target.name === 'source_id') {
                new_value = event.target.value;
                // Convert source_id to user_source_id in the form data
                const sourceId = parseInt(new_value, 10);
                draft['user_details']['source_id'] = sourceId;
                draft['user_details']['user_source_id'] = sourceId;
                // Check if Domain is selected (id: 2)
                if (sourceId === 2) {
                    setShowDomainWarning(true);
                    setValidationErrors(prev => ({
                        ...prev,
                        source_id: 'For Domain Source, contact System Admin for registration'
                    }));
                } else {
                    setShowDomainWarning(false);
                    setValidationErrors(prev => ({
                        ...prev,
                        source_id: null
                    }));
                }
                console.log('Source selected:', {
                    source_id: sourceId,
                    user_source_id: sourceId
                });
            } else {
                new_value = event.target.value;
            }

            if (event.target.name !== 'source_id') {
                draft['user_details'][event.target.name] = new_value;
            }
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        // Basic validation
        const errors = {};
        if (!formData.user_details.first_name) errors.first_name = 'First name is required';
        if (!formData.user_details.last_name) errors.last_name = 'Last name is required';
        if (!formData.user_details.email_address) errors.email_address = 'Email address is required';
        if (!isEditMode && !formData.user_details.password) errors.password = 'Password is required';
        if (!formData.user_details.subsidiary_id) errors.subsidiary_id = 'Subsidiary is required';
        if (!formData.user_details.source_id) errors.source_id = 'Source is required';

        // Check if there are any validation errors
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Check if Domain is selected (id: 2)
        const sourceId = parseInt(formData.user_details.source_id, 10);
        if (sourceId === 2) {
            setShowDomainWarning(true);
            setValidationErrors(prev => ({
                ...prev,
                source_id: 'For Domain Source, contact System Admin for registration'
            }));
            return;
        }

        // Create the final form data with all required fields
        const finalFormData = {
            ...formData,
            user_details: {
                ...formData.user_details,
                source_id: sourceId,
                user_source_id: sourceId,
                send_login_details: true,
                automatically_create_password: false,
                require_password_change: formData.user_details.require_password_change || false
            }
        };

        // Log the complete payload for debugging
        console.log('Complete submission payload:', JSON.stringify(finalFormData, null, 2));

        onNext(finalFormData);
    }

    function handleCancel(e) {
        e.preventDefault();
        onCancel();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* User Source Dropdown */}
                <div className='bg-white rounded-lg p-6'>
                    <div className='flex flex-col gap-6'>
                        <div className='flex flex-col gap-3'>
                            <label className='text-[12px] font-normal'>Source:</label>
                            <div className='w-1/2'>
                                <SelectDropdown 
                                    placeholder={'Select Source'} 
                                    items={sourceItems} 
                                    name={'source_id'} 
                                    selected={formData.user_details.source_id} 
                                    onSelect={handleChange}
                                    isCollapsed={!sourceDropdownOpen}
                                    onToggleCollapse={(collapsed) => setSourceDropdownOpen(!collapsed)}
                                    error={validationErrors.source_id}
                                />
                                {showDomainWarning && (
                                    <div className="mt-2 text-red-600 text-sm">
                                        For Domain Source, contact System Admin for registration
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'> 
                            <div>
                                <label className="block text-sm mb-1">First Name *</label>
                                <div className='flex flex-col gap-2'>
                                    <input 
                                        id='first_name' 
                                        type="text" 
                                        name='first_name' 
                                        value={formData.user_details.first_name} 
                                        onChange={handleChange} 
                                        className='w-full p-3 border border-border-gray rounded-lg text-[12px]' 
                                    />
                                    {validationErrors.first_name && <div className='text-sm text-red-500'>{validationErrors.first_name}</div>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Last Name *</label>
                                <div className='flex flex-col gap-2'>
                                    <input 
                                        id='last_name' 
                                        type="text" 
                                        name='last_name' 
                                        value={formData.user_details.last_name} 
                                        onChange={handleChange} 
                                        className='w-full p-3 border border-border-gray rounded-lg text-[12px]' 
                                    />
                                    {validationErrors.last_name && <div className='text-sm text-red-500'>{validationErrors.last_name}</div>}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3'> {/* email field */}
                            <label htmlFor="email_address" className='text-[12px] font-normal'>Email Address *</label>
                            <div className='flex flex-col gap-2'>
                                <input 
                                    id='email_address' 
                                    type="email" 
                                    name='email_address' 
                                    value={formData.user_details.email_address} 
                                    onChange={handleChange} 
                                    readOnly={isEditMode}
                                    disabled={isEditMode}
                                    placeholder='Enter email address' 
                                    className={`placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 border-pink-on-focus text-[12px] ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {validationErrors.email_address && <div className='text-sm text-red-500'>{validationErrors.email_address}</div>}
                            </div>
                        </div>

                        <div className='flex gap-6'>
                            <div className='flex flex-col gap-3 grow'>
                                <label className='text-[12px] font-normal'>Subsidiary</label>
                                <SelectDropdown 
                                    placeholder={'Select Subsidiary'} 
                                    items={(() => {
                                        // Handle both nested and flat data structures
                                        const subsidiaryData = Array.isArray(subsidiaries) ? subsidiaries : (subsidiaries?.subsidiaries || []);
                                        console.log('Raw subsidiary data:', subsidiaryData);
                                        
                                        const items = subsidiaryData
                                            .filter(sub => sub && typeof sub === 'object')
                                            .map((sub) => ({ 
                                                id: `sub_${sub.id || sub.subsidiary_id}`, 
                                                text: sub.name || sub.subsidiary_name || `Subsidiary ${sub.id || sub.subsidiary_id}`
                                            }));
                                        console.log('Transformed subsidiary items:', items);
                                        return items;
                                    })()} 
                                    name={'subsidiary_id'} 
                                    selected={formData.user_details.subsidiary_id ? `sub_${formData.user_details.subsidiary_id}` : null} 
                                    onSelect={(e) => {
                                        console.log('Subsidiary selected:', e.target.value);
                                        handleChange({
                                            target: {
                                                name: e.target.name,
                                                value: e.target.value
                                            }
                                        });
                                    }}
                                    isCollapsed={!companyDropdownOpen}
                                    onToggleCollapse={(collapsed) => setCompanyDropdownOpen(!collapsed)}
                                />
                                {validationErrors.subsidiary_id && (
                                    <div className='text-sm text-red-500'>{validationErrors.subsidiary_id}</div>
                                )}
                            </div>
                            <div className='flex flex-col gap-3 grow'>
                                <label className='text-[12px] font-normal'>Supervisor</label>
                                <SelectDropdown 
                                    placeholder={'Select Supervisor'} 
                                    items={(Array.isArray(supervisors) ? supervisors : [])
                                        .filter(sup => sup && typeof sup === 'object')
                                        .map((sup) => {
                                            // Use user_id for API compatibility
                                            const id = sup.user_id || sup.id;
                                            const firstName = sup.firstname || sup.first_name || '';
                                            const lastName = sup.lastname || sup.last_name || '';
                                            return { 
                                                id: `sup_${id}`, 
                                                text: `${firstName} ${lastName}`.trim() || `Supervisor ${id}`
                                            };
                                        })} 
                                    name={'supervisor_id'} 
                                    selected={formData.user_details.supervisor_id ? `sup_${formData.user_details.supervisor_id}` : null} 
                                    onSelect={(e) => handleChange({
                                        target: {
                                            name: e.target.name,
                                            value: e.target.value
                                        }
                                    })}
                                    isCollapsed={!supervisorDropdownOpen}
                                    onToggleCollapse={(collapsed) => setSupervisorDropdownOpen(!collapsed)}
                                />
                                {validationErrors.supervisor_id && (
                                    <div className='text-sm text-red-500'>{validationErrors.supervisor_id}</div>
                                )}
                            </div>
                        </div>

                        {!isEditMode && (
                            <div className='flex flex-col gap-3'> {/* password field */}
                                <label className="block text-[12px] font-medium mb-2">
                                    Password {!isEditMode && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.user_details.password}
                                    onChange={handleChange}
                                    placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                                    className={`w-full p-3 border rounded-lg text-[12px] border-border-gray ${
                                        validationErrors.password ? 'border-red-500' : ''
                                    } border-pink-on-focus`}
                                />
                                {validationErrors.password && (
                                    <p className="text-red-500 text-[10px] mt-1">{validationErrors.password}</p>
                                )}
                            </div>
                        )}

                        <div className='flex flex-col gap-3'> {/* require password change */}
                            <label className='flex gap-2 items-center self-start cursor-pointer select-none'>
                                <input type="checkbox" name="require_password_change" checked={formData.user_details.require_password_change} onChange={handleChange} />
                                <span className='text-[12px]'>Require user to change password on first log in</span>
                            </label>
                        </div>

                        <div className='flex items-center justify-between mt-6 gap-4'>
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="flex-1 py-3 text-black font-medium bg-[#E0E0E0] hover:bg-[#D3D3D3] rounded-lg text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 text-white font-medium bg-[#E91E63] hover:bg-[#D81B60] rounded-lg text-center"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* My Queue Section */}
                <div className='bg-white rounded-lg p-6'>
                    <div className='flex flex-col gap-4'>
                        <h3 className='text-lg font-medium'>My Queue</h3>
                        <div className='flex gap-2 items-center'>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={queueSearchTerm}
                                onChange={(e) => setQueueSearchTerm(e.target.value)}
                                className='flex-1 p-2 border border-border-gray rounded-lg text-[12px]'
                            />
                        </div>
                        <div className='max-h-60 overflow-y-auto'>
                            {isLoadingQueue ? (
                                <div className='text-center py-4'>Loading queue...</div>
                            ) : filteredQueueUsers.length > 0 ? (
                                <table className='w-full'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Name</th>
                                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Email</th>
                                            <th className='px-4 py-2 text-center text-xs font-medium text-gray-500'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQueueUsers.map((user) => (
                                            <tr key={user.email} className='border-t'>
                                                <td className='px-4 py-2 text-sm'>{`${user.firstname} ${user.lastname}`}</td>
                                                <td className='px-4 py-2 text-sm'>{user.email}</td>
                                                <td className='px-4 py-2 text-center'>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(draft => {
                                                                draft.user_details = {
                                                                    ...draft.user_details,
                                                                    first_name: user.firstname,
                                                                    last_name: user.lastname,
                                                                    email_address: user.email,
                                                                    subsidiary_id: user.subsidiary_id || null,
                                                                    supervisor_id: user.supervisor_id || '',
                                                                    require_password_change: true
                                                                };
                                                            });
                                                        }}
                                                        className='text-[#E91E63] hover:text-[#D81B60] text-sm font-medium'
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className='text-center py-4 text-gray-500'>No non-licensed users found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddUserDetailsForm;
