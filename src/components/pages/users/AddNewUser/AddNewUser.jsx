import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useImmer } from 'use-immer';
import AddUserDetailsForm from '../../../partials/forms/manage-users/AddUserDetailsForm/AddUserDetailsForm';
import AssignLicenseAndPermissions from '../../../partials/forms/manage-users/AssignLicenseAndPermissions/AssignLicenseAndPermissions';
import AddNewUserReview from '../../../partials/forms/manage-users/AddNewUserReview/AddNewUserReview';
import { fetchUser, useAddUser, useUpdateUserProfile, supervisorsOptions, subsidiariesOptions } from '../../../../queries/users-queries';

const initialFormData = {
    user_details: {
        first_name: '',
        last_name: '',
        email_address: '',
        password: '',
        supervisor_id: '',
        subsidiary_id: null,
        source_id: '1', // Set default source ID to '1'
        require_password_change: false,
    },
    user_licenses: [],
    user_permissions: {
        set_as_admin: false,
        permission_ids: []
    }
};


function AddNewUser() {
    const [searchParams] = useSearchParams();
    const urlUserId = searchParams.get('u');
    const [selectedUserId, setSelectedUserId] = useState(urlUserId);
    const [formData, setFormData] = useImmer(initialFormData);
    const [isEditMode, setIsEditMode] = useState(!!urlUserId);
    const [currentStep, setCurrentStep] = useState(1);
    const [stepsCompleted, setStepsCompleted] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Define steps array at the top of the component
    const steps = [
        { title: 'User Details' },
        ...(isEditMode ? [] : [{ title: 'Licenses & Permissions' }]),
        { title: 'Review' }
    ];

    const { data: supervisors, isLoading: isLoadingSupervisors, error: supervisorsError } = useQuery(supervisorsOptions());
    const { data: subsidiaries, isLoading: isLoadingSubsidiaries, error: subsidiariesError } = useQuery(subsidiariesOptions());

    // Fetch user data if in edit mode (either from URL or table selection)
    const { data: userData, isLoading: isLoadingUser } = useQuery({
        queryKey: ['user', selectedUserId],
        queryFn: () => fetchUser({ queryKey: ['user', selectedUserId] }),
        enabled: !!selectedUserId,
        staleTime: 0,
        cacheTime: 0
    });

    // Debug and handle user ID updates in a single effect
    useEffect(() => {
        const hasUserId = formData.user_details.user_id || selectedUserId;
        
        // Debug logging
        console.log('State Update:', {
            selectedUserId,
            isEditMode,
            'formData.user_details.user_id': formData.user_details.user_id,
            'formData.user_details': formData.user_details,
            hasUserId,
            currentStep
        });

        if (hasUserId) {
            setIsEditMode(true);
            
            // Ensure user ID is in form data
            if (!formData.user_details.user_id) {
                setFormData(draft => {
                    draft.user_details.user_id = parseInt(hasUserId, 10);
                });
            }
        }
    }, [selectedUserId, formData.user_details.user_id]);

    // Add effect to track isEditMode changes
    useEffect(() => {
        console.log('isEditMode changed:', isEditMode);
        console.log('Current form data:', formData);
    }, [isEditMode, formData]);

    // Populate form with user data when available
    useEffect(() => {
        if (isEditMode && selectedUserId) {
            console.log('Edit mode detected, fetching user data for ID:', selectedUserId);
            const fetchUserData = async () => {
                try {
                    const userData = await fetchUser({ queryKey: ['user', selectedUserId] });
                    console.log('Fetched user data:', userData);
                    
                    // Helper function to extract permission IDs
                    const extractPermissionIds = (permissions) => {
                        if (!Array.isArray(permissions)) return [];
                        return permissions.map(p => {
                            if (typeof p === 'number') return p;
                            if (typeof p === 'string') return parseInt(p, 10);
                            if (p && (p.id || p.permission_id)) return parseInt(p.id || p.permission_id, 10);
                            return null;
                        }).filter(id => id !== null);
                    };
                    
                    // Initialize form data with existing user data
                    setFormData(prevData => {
                        const newFormData = {
                            ...prevData,
                            user_details: {
                                ...prevData.user_details,
                                first_name: userData.firstname || '',
                                last_name: userData.lastname || '',
                                email_address: userData.email || '',
                                supervisor_id: userData.supervisor || '',
                                subsidiary_id: userData.subsidiary_id ? parseInt(userData.subsidiary_id, 10) : null,
                                source_id: userData.user_source_id || '',
                                user_id: userData.user_id || '',
                                user_source_id: userData.user_source_id || ''
                            },
                            // Preserve existing permissions with proper ID format
                            user_permissions: {
                                set_as_admin: userData.is_admin || false,
                                permission_ids: extractPermissionIds(userData.permissions || userData.permission_ids || [])
                            },
                            // Ensure licenses are properly formatted and preserved
                            user_licenses: Array.isArray(userData.user_licenses) 
                                ? userData.user_licenses.map(license => ({
                                    module_id: license.module_id === 'risk' ? 1 : 
                                              license.module_id === 'processes' ? 2 : 
                                              parseInt(license.module_id, 10),
                                    license_type_id: license.license_type_id === 'Named User' ? 1 :
                                                   license.license_type_id === 'Read-only' ? 2 :
                                                   parseInt(license.license_type_id, 10)
                                }))
                                : []
                        };
                        console.log('Updated form data:', newFormData);
                        return newFormData;
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            
            fetchUserData();
        }
    }, [isEditMode, selectedUserId]);

    const addUserMutation = useAddUser({
        onSuccess: () => {
            setNotification({ show: true, message: 'User added successfully!', type: 'success' });
            setTimeout(() => {
                window.location.href = '/users';
            }, 2000);
        }
    });

    const updateUserMutation = useUpdateUserProfile({
        onSuccess: () => {
            setNotification({ show: true, message: 'User updated successfully!', type: 'success' });
            setTimeout(() => {
                window.location.href = '/users';
            }, 2000);
        }
    });

    const handleMutationError = (error) => {
        console.error('Operation error:', error);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
            if (error.response.data.message?.includes('No license found')) {
                setNotification({ 
                    show: true, 
                    message: `User ${isEditMode ? 'updated' : 'created'} successfully, but license assignment failed. Please check available licenses.`,
                    type: 'warning'
                });
                setTimeout(() => {
                    navigate('/users');
                }, 6000);
                return;
            }
        }
        setNotification({ 
            show: true, 
            message: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} user`, 
            type: 'error' 
        });
        setShowConfirmation(false);
    };

    function validatePassword(password) {
        if (!password && isEditMode) return "";
        
        const hasNumber = /\d/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNoSpaces = !/\s/.test(password);
        const isLongEnough = password.length >= 8;

        const errors = [];
        if (!hasNumber) errors.push("at least one number");
        if (!hasLower) errors.push("one lowercase letter");
        if (!hasUpper) errors.push("one uppercase letter");
        if (!hasSpecial) errors.push("one special character");
        if (!hasNoSpaces) errors.push("no spaces");
        if (!isLongEnough) errors.push("minimum 8 characters");

        return errors.length === 0 ? "" : `Password must contain ${errors.join(", ")}`;
    }

    const handleConfirmSubmit = async () => {
        try {
            setShowConfirmation(false);
            const effectiveUserId = formData.user_details.user_id || selectedUserId;
            const shouldBeEditMode = Boolean(effectiveUserId);
            
            // Determine if this is a queue user (email-based ID)
            const isQueueUser = typeof effectiveUserId === 'string' && effectiveUserId.includes('@');

            console.log('Submitting user update with data:', {
                effectiveUserId,
                shouldBeEditMode,
                isQueueUser,
                formData: JSON.stringify(formData, null, 2)
            });

            // Prepare the payload
            const payload = {
                user_details: {
                    ...formData.user_details,
                    user_id: effectiveUserId
                },
                // Always use the current form data for licenses and permissions
                user_licenses: formData.user_licenses || [],
                user_permissions: {
                    set_as_admin: formData.user_permissions?.set_as_admin || false,
                    permission_ids: formData.user_permissions?.permission_ids || []
                }
            };

            console.log('Prepared payload:', JSON.stringify(payload, null, 2));

            if (shouldBeEditMode) {
                if (isQueueUser) {
                    console.log('Updating queue user with email:', formData.user_details.email_address);
                    await updateUserMutation.mutateAsync({ 
                        userId: formData.user_details.email_address, 
                        formData: payload,
                        isQueueUser: true
                    });
                } else {
                    console.log('Updating regular user with ID:', effectiveUserId);
                    await updateUserMutation.mutateAsync({ 
                        userId: effectiveUserId, 
                        formData: payload 
                    });
                }
            } else {
                console.log('Creating new user');
                await addUserMutation.mutateAsync({ formData: payload });
            }
        } catch (error) {
            console.error('Error submitting user:', error);
            handleMutationError(error);
        }
    };

    // Handle step changes
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prevStep => prevStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prevStep => prevStep - 1);
        } else {
            navigate(-1);
        }
    };

    // Validate current step
    const validateStep = (step) => {
        const errors = {};
        
        if (step === 1) {
            if (!formData.user_details.first_name?.trim()) {
                errors.first_name = 'First name is required';
            }
            if (!formData.user_details.last_name?.trim()) {
                errors.last_name = 'Last name is required';
            }
            if (!formData.user_details.email_address?.trim()) {
                errors.email_address = 'Email address is required';
            }
            if (!isEditMode && !formData.user_details.password?.trim()) {
                errors.password = 'Password is required for new users';
            } else if (!isEditMode && formData.user_details.password) {
                const passwordError = validatePassword(formData.user_details.password);
                if (passwordError) {
                    errors.password = passwordError;
                }
            }
        } else if (step === 2 && !isEditMode) {
            // No validation for licenses and permissions - they are optional
        } else if (step === 3) {
            // Validate review step
            if (!formData.user_details.first_name?.trim() || 
                !formData.user_details.last_name?.trim() || 
                !formData.user_details.email_address?.trim()) {
                errors.review = 'Please complete all required fields';
            }
            if (!isEditMode && formData.user_details.password) {
                const passwordError = validatePassword(formData.user_details.password);
                if (passwordError) {
                    errors.password = passwordError;
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <AddUserDetailsForm
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        onNext={handleNext}
                        onCancel={() => navigate('/users')}
                        isEditMode={isEditMode}
                        onUserSelect={handleUserSelect}
                        supervisors={supervisors}
                        subsidiaries={subsidiaries}
                    />
                );
            case 2:
                return isEditMode ? (
                    <AddNewUserReview
                        formData={formData}
                        onBack={handleBack}
                        onSubmit={() => setShowConfirmation(true)}
                        supervisors={supervisors}
                        subsidiaries={subsidiaries}
                        isEditMode={isEditMode}
                    />
                ) : (
                    <AssignLicenseAndPermissions
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <AddNewUserReview
                        formData={formData}
                        onBack={handleBack}
                        onSubmit={() => setShowConfirmation(true)}
                        supervisors={supervisors}
                        subsidiaries={subsidiaries}
                        isEditMode={isEditMode}
                    />
                );
            default:
                return null;
        }
    };

    // Handle user selection from table
    const handleUserSelect = (user) => {
        console.log('Selected user:', user);
        
        // For users from queue, we treat them as existing users
        if (user.isQueueUser) {
            console.log('Handling queue user:', user);
            setIsEditMode(true); // This will be an existing user
            setSelectedUserId(user.email); // Use email as ID for queue users
            
            // Update form data with queue data
            setFormData(draft => {
                draft.user_details = {
                    ...draft.user_details,
                    first_name: user.first_name || user.firstname || '',
                    last_name: user.last_name || user.lastname || '',
                    email_address: user.email_address || user.email || '',
                    user_id: user.email, // Use email as ID for queue users
                    subsidiary_id: user.subsidiary_id ? parseInt(user.subsidiary_id, 10) : null,
                    supervisor_id: user.supervisor_id || '',
                    source_id: user.source_id || '1', // Preserve source_id
                    password: '', // Clear password since we're editing
                    require_password_change: true
                };
            });
            return;
        }

        // For users with user_id (from edit button)
        const userId = parseInt(user.user_id, 10);
        console.log('Editing existing user with ID:', userId);
        
        if (!userId) {
            console.error('Invalid user ID from selection:', user);
            return;
        }

        // Update both states for existing user
        setSelectedUserId(userId);
        setIsEditMode(true);

        // Update form data with exact field names from queue
        setFormData(draft => {
            console.log('Updating form data with userId:', userId);
            draft.user_details = {
                ...draft.user_details,
                first_name: user.firstname || '',
                last_name: user.lastname || '',
                email_address: user.email || '',
                user_id: userId,
                subsidiary_id: user.subsidiary_id ? parseInt(user.subsidiary_id, 10) : null,
                supervisor_id: user.supervisor_id?.toString() || '',
                source_id: user.source_id || '1', // Preserve source_id
                password: '' // Clear password since we're editing
            };
        });
    };

    return (
        <div className='p-6'>
            {/* Breadcrumb Navigation */}
            <div className="mb-4 flex items-center text-sm text-gray-600">
                <Link to="/users" className="hover:text-pink-600">Users</Link>
                <span className="mx-2">/</span>
                <span className="text-pink-600">{isEditMode ? 'Edit User' : 'Add New User'}</span>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 w-full">
                <div className="flex w-full">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex-1 flex justify-center">
                            {/* Step Circle and Title */}
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2
                                    ${currentStep > index ? 'bg-pink-600 border-pink-600 text-white' :
                                      currentStep === index ? 'border-pink-600 text-pink-600' :
                                      'border-gray-300 text-gray-300'}`}>
                                    {currentStep > index ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <p className={`text-sm font-medium
                                    ${currentStep >= index ? 'text-pink-600' : 'text-gray-400'}`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Steps */}
            <div className="bg-white rounded-lg p-6 mt-12">
                {renderStep()}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            {isEditMode ? "Confirm User Update" : "Confirm User Creation"}
                        </h3>
                        <p className="mb-6">
                            {isEditMode
                                ? "Are you sure you want to update this user?"
                                : "Are you sure you want to create this user?"}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                onClick={() => setShowConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                                onClick={handleConfirmSubmit}
                            >
                                {isEditMode ? "Update User" : "Create User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                } text-white`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default AddNewUser;
