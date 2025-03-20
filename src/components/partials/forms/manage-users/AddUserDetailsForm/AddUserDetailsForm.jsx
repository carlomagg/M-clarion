import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { supervisorsOptions, subsidiariesOptions, usersOptions, fetchNonLicensedUsers } from '../../../../../queries/users-queries';
import './AddUserDetailsForm.css';

function AddUserDetailsForm({ formData, setFormData, validationErrors, setValidationErrors, onNext, onCancel, isEditMode, onUserSelect }) {
    const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
    const [supervisorDropdownOpen, setSupervisorDropdownOpen] = useState(false);
    const [queueSearchTerm, setQueueSearchTerm] = useState('');

    // Fetch data with enabled queries and error handling
    const { data: subsidiaries = [], error: subsidiariesError, isLoading: isLoadingSubsidiaries } = useQuery({
        ...subsidiariesOptions(),
        enabled: true,
        onError: (error) => {
            console.error('Subsidiaries query error:', error.message || error);
        },
        onSuccess: (data) => {
            console.log('Subsidiaries data received:', data);
        }
    });

    const { data: supervisors = [], error: supervisorsError, isLoading: isLoadingSupervisors } = useQuery({
        ...supervisorsOptions(),
        enabled: true,
        onError: (error) => {
            console.error('Supervisors query error:', error.message || error);
        }
    });

    const { data: queueData = [], isLoading: isLoadingUsers, error: queueError } = useQuery({
        queryKey: ['nonLicensedUsers'],
        queryFn: fetchNonLicensedUsers,
        enabled: true,
        onError: (error) => {
            console.error('Non-licensed users query error:', error.message || error);
        }
    });

    // Log errors if present
    useEffect(() => {
        if (subsidiariesError) {
            console.error('Subsidiaries Error:', subsidiariesError.message || subsidiariesError);
        }
        console.log('Current subsidiaries state:', subsidiaries);
        if (supervisorsError) {
            console.error('Supervisors Error:', supervisorsError.message || supervisorsError);
        }
        if (queueError) {
            console.error('Non-licensed users Error:', queueError.message || queueError);
        }
    }, [subsidiariesError, supervisorsError, queueError, subsidiaries]);

    // Mock data for dropdowns - replace these with API calls later
    const mockSources = [
        { id: 1, text: 'M-Clarion' },
        { id: 2, text: 'External System' },
        { id: 3, text: 'Partner Network' }
    ];

    // Filter queue data based on search term
    const filteredQueueData = queueData.filter(user => {
        const searchTerm = queueSearchTerm.toLowerCase();
        return (
            user.firstname?.toLowerCase().includes(searchTerm) ||
            user.lastname?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm)
        );
    });

    // Handle selecting a user from queue
    const handleSelectQueueUser = (user) => {
        setFormData(draft => {
            draft.user_details.first_name = user.firstname || '';
            draft.user_details.last_name = user.lastname || '';
            draft.user_details.email_address = user.email || '';
            draft.user_details.user_id = user.user_id;
            draft.user_details.subsidiary_id = user.subsidiary_id || null;
            draft.user_details.supervisor_id = user.supervisor_id?.toString() || '';
        });
    };

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
                // Ensure supervisor_id is a string as required by API
                new_value = rawValue || null;
            } else {
                new_value = event.target.value;
            }

            draft['user_details'][event.target.name] = new_value;
        });

        // Clear validation error when field is changed
        if (validationErrors[event.target.name]) {
            setValidationErrors(prev => ({
                ...prev,
                [event.target.name]: ''
            }));
        }
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
        if (!formData.user_details.supervisor_id) errors.supervisor_id = 'Supervisor is required';
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // If validation passes, move to next step
        setValidationErrors({});
        onNext();
    }

    function handleCancel() {
        onCancel();
    }

    return (
        <div className='flex flex-col gap-6'>
            {/* User Details Form */}
            <div className='bg-white rounded-lg p-6'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-3'>
                        <label className='text-[12px] font-normal'>Source:</label>
                        <div className='w-1/2'>
                            <SelectDropdown 
                                placeholder={'Select Source'} 
                                items={mockSources} 
                                name={'source_id'} 
                                selected={formData.user_details.source_id} 
                                onSelect={handleChange}
                                isCollapsed={!sourceDropdownOpen}
                                onToggleCollapse={(collapsed) => setSourceDropdownOpen(!collapsed)}
                            />
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
                </form>
            </div>

            {/* Queue Section - Now at the bottom */}
            <div className='bg-white rounded-lg p-6'>
                <h3 className='text-[12px] font-medium mb-4'>My Queue</h3>
                <div className='mb-4'>
                    <input 
                        type="text" 
                        placeholder="Search by first name, last name or email address"
                        className='w-full placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink text-[12px]'
                        value={queueSearchTerm}
                        onChange={(e) => setQueueSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <div className="max-h-[250px] overflow-y-auto">
                        <table className='w-full table-fixed'>
                            <thead>
                                <tr className='text-center border-b'>
                                    <th className='pb-2 font-normal text-[12px] px-4' style={{width: '25%'}}>First Name</th>
                                    <th className='pb-2 font-normal text-[12px] px-4' style={{width: '25%'}}>Last Name</th>
                                    <th className='pb-2 font-normal text-[12px] px-4' style={{width: '40%'}}>Email Address</th>
                                    <th className='pb-2 font-normal text-[12px] px-4' style={{width: '10%'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingUsers ? (
                                    <tr>
                                        <td colSpan="5" className='py-4 text-center text-[12px]'>Loading users...</td>
                                    </tr>
                                 ) : queueData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className='py-4 text-center text-[12px]'>No users without licenses found</td>
                                    </tr>
                                ) : (
                                    filteredQueueData.map(user => (
                                        <tr key={user.email} className='border-b hover:bg-gray-50'>
                                            <td className='py-3 text-[12px] text-center px-4'>{user.firstname}</td>
                                            <td className='py-3 text-[12px] text-center px-4'>{user.lastname}</td>
                                            <td className='py-3 text-[12px] text-center px-4'>{user.email}</td>
                                            <td className='py-3 text-center px-4'>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Only call the parent handler
                                                        const userData = {
                                                            ...user,
                                                            // Handle both field formats
                                                            first_name: user.first_name || user.firstname || '',
                                                            last_name: user.last_name || user.lastname || '',
                                                            email_address: user.email_address || user.email || '',
                                                            // For queue users, we want to edit them
                                                            user_id: user.id || user.user_id || user.email, // Use email as fallback ID
                                                            subsidiary_id: user.subsidiary_id || null,
                                                            supervisor_id: user.supervisor_id || null,
                                                            // Set these to ensure proper handling
                                                            require_password_change: true,
                                                            password: '',
                                                            // Force edit mode for queue users
                                                            isQueueUser: true
                                                        };

                                                        // Log the user data being passed
                                                        console.log('Queue Selection - User Data:', userData);
                                                        
                                                        onUserSelect(userData);
                                                    }}
                                                    className='text-[12px] text-blue-600 hover:text-blue-800'
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddUserDetailsForm;
