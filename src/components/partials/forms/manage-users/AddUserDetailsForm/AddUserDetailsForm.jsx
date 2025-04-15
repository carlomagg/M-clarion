import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { supervisorsOptions, subsidiariesOptions, usersOptions, userSourcesOptions } from '../../../../../queries/users-queries';
import './AddUserDetailsForm.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaKey } from 'react-icons/fa';

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
    const [showDomainWarning, setShowDomainWarning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    // Function to check password strength
    const checkPasswordStrength = (password) => {
        if (!password) return '';
        
        let score = 0;
        // Check length
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Check for numbers
        if (/\d/.test(password)) score++;
        
        // Check for lowercase
        if (/[a-z]/.test(password)) score++;
        
        // Check for uppercase
        if (/[A-Z]/.test(password)) score++;
        
        // Check for special characters
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        
        // Return strength based on score
        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    };

    // Fetch sources from API
    const { data: sources = [], isLoading: isLoadingSources } = useQuery(userSourcesOptions());
    
    useEffect(() => {
        // Log sources data when it changes
        console.log('Sources data:', sources);
    }, [sources]);
    
    // Auto-generate password on component mount for new users
    useEffect(() => {
        if (!isEditMode && !formData.user_details.password) {
            handleGeneratePassword();
        }
    }, []);

    // Format sources for dropdown
    const sourceItems = sources.map(source => ({
        id: source.id,
        text: source.name
    }));

    // Add password generation function
    const generateStrongPassword = () => {
        const length = 12;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        // Ensure at least one of each required character type
        let password = "";
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill the rest with random characters from all possible characters
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password to ensure the required characters aren't always in the same position
        return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generateStrongPassword();
        setFormData(draft => {
            draft.user_details.password = generatedPassword;
        });
        setPasswordStrength(checkPasswordStrength(generatedPassword));
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
                new_value = event.target.value ? parseInt(event.target.value, 10) : null;
                console.log('Setting subsidiary_id to:', new_value);
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

        if (event.target.name === 'password') {
            setPasswordStrength(checkPasswordStrength(event.target.value));
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
                            <div className='flex flex-col gap-2 w-1/2'>
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
                                    placeholder={formData.user_details.subsidiary_id ? undefined : 'Select Subsidiary'} 
                                    items={(() => {
                                        // Handle both nested and flat data structures
                                        const subsidiaryData = Array.isArray(subsidiaries) ? subsidiaries : (subsidiaries?.subsidiaries || []);
                                        console.log('Raw subsidiary data:', subsidiaryData);
                                        console.log('Current formData subsidiary_id:', formData.user_details.subsidiary_id);
                                        
                                        const items = subsidiaryData
                                            .filter(sub => sub && typeof sub === 'object')
                                            .map((sub) => {
                                                const id = parseInt(sub.id || sub.subsidiary_id, 10);
                                                const text = sub.name || sub.subsidiary_name || `Subsidiary ${id}`;
                                                console.log(`Mapping subsidiary: id=${id}, text=${text}`);
                                                return { id, text };
                                            });
                                        console.log('Transformed subsidiary items:', items);
                                        return items;
                                    })()} 
                                    name={'subsidiary_id'} 
                                    selected={formData.user_details.subsidiary_id} 
                                    onSelect={(e) => {
                                        const selectedId = parseInt(e.target.value, 10);
                                        console.log('Subsidiary selected:', selectedId);
                                        handleChange({
                                            target: {
                                                name: 'subsidiary_id',
                                                value: selectedId
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
                            <div className='grid grid-cols-2 gap-4'> {/* password field */}
                                <div className='flex flex-col gap-3'>
                                    <label className="block text-[12px] font-medium mb-2">
                                        Password {!isEditMode && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.user_details.password}
                                            onChange={handleChange}
                                            placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                                            className={`w-full p-3 border rounded-lg text-[12px] border-border-gray ${
                                                validationErrors.password ? 'border-red-500' : ''
                                            } border-pink-on-focus`}
                                        />
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <AiOutlineEye size={16} /> : <AiOutlineEyeInvisible size={16} />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleGeneratePassword}
                                                className="text-pink-600 hover:text-pink-700 text-xs font-medium flex items-center gap-1"
                                            >
                                                <FaKey size={12} />
                                                Auto Generate
                                            </button>
                                        </div>
                                    </div>
                                    {validationErrors.password && (
                                        <p className="text-red-500 text-[10px] mt-1">{validationErrors.password}</p>
                                    )}
                                    {passwordStrength && (
                                        <>
                                            <div className={`password-strength-indicator ${
                                                passwordStrength === 'weak' ? 'password-strength-weak' :
                                                passwordStrength === 'medium' ? 'password-strength-medium' :
                                                'password-strength-strong'
                                            }`} />
                                            <p className={`text-[10px] mt-1 ${
                                                passwordStrength === 'weak' ? 'text-red-500' :
                                                passwordStrength === 'medium' ? 'text-yellow-500' :
                                                'text-green-500'
                                            }`}>
                                                Password strength: {passwordStrength}
                                            </p>
                                        </>
                                    )}
                                    <p className="text-gray-500 text-[10px] mt-1">
                                        Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, one special character, and no spaces
                                    </p>
                                </div>
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
            </div>
        </form>
    );
}

export default AddUserDetailsForm;
