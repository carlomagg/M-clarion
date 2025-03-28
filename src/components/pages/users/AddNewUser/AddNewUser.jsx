import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    }, [selectedUserId, formData.user_details.user_id, currentStep]);

    // Add effect to track isEditMode changes
    useEffect(() => {
        console.log('isEditMode changed:', isEditMode);
        console.log('Current form data:', formData);
    }, [isEditMode, formData]);

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
                    subsidiary_id: user.subsidiary_id || null,
                    supervisor_id: user.supervisor_id || '',
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
                subsidiary_id: user.subsidiary_id || null,
                supervisor_id: user.supervisor_id?.toString() || '',
                password: '' // Clear password since we're editing
            };
        });
    };

    // Populate form with user data when available
    useEffect(() => {
        if (userData) {
            console.log('Populating form with user data:', userData);
            console.log('Current selectedUserId:', selectedUserId);
            
            const userId = parseInt(userData.user_id || selectedUserId, 10);
            console.log('Using userId for form data:', userId);
            
            // Ensure isEditMode is set to true when we have user data
            setIsEditMode(true);
            
            setFormData(draft => {
                // User details with exact field names
                draft.user_details = {
                    ...draft.user_details,
                    first_name: userData.firstname || '',    // Match queue format
                    last_name: userData.lastname || '',      // Match queue format
                    email_address: userData.email || '',     // Match queue format
                    user_id: userId,
                    subsidiary_id: userData.subsidiary_id || null,
                    supervisor_id: userData.supervisor_id?.toString() || '',
                    require_password_change: userData.require_password_change || false,
                    password: '' // Clear password in edit mode
                };
                
                // Licenses
                draft.user_licenses = (userData.licenses || []).map(license => ({
                    module_id: license.module_id,
                    license_type_id: license.license_type_id
                }));
                
                // Permissions
                draft.user_permissions = {
                    set_as_admin: userData.is_admin || false,
                    permission_ids: (userData.permissions || [])
                        .map(perm => perm.id || perm.permission_id)
                        .filter(id => id != null)
                };
            });
        }
    }, [userData, selectedUserId]);

    const addUserMutation = useAddUser({
        onSuccess: () => {
            setNotification({ show: true, message: 'User added successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/users');
            }, 2000);
        }
    });

    const updateUserMutation = useUpdateUserProfile({
        onSuccess: () => {
            setNotification({ show: true, message: 'User updated successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/users');
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
                }, 3000);
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

    function validateStep(step) {
        const validationErrors = {};

        if (step === 1) {
            if (!formData.user_details.first_name.trim()) validationErrors.first_name = 'First name is required';
            if (!formData.user_details.last_name.trim()) validationErrors.last_name = 'Last name is required';
            if (!formData.user_details.email_address.trim()) validationErrors.email_address = 'Email address is required';
            if (!isEditMode || formData.user_details.password?.trim()) {
                const passwordError = validatePassword(formData.user_details.password);
                if (passwordError) validationErrors.password = passwordError;
            }
            if (!formData.user_details.subsidiary_id) validationErrors.subsidiary_id = 'Subsidiary is required';
        }

        if (step === 2) {
            // Validate licenses
            if (!Array.isArray(formData.user_licenses) || formData.user_licenses.length === 0) {
                validationErrors.licenses = 'At least one license must be assigned';
            } else {
                const licenseErrors = formData.user_licenses.map((license, index) => {
                    const errors = {};
                    if (!license.module_id) errors.module_id = 'Module is required';
                    if (!license.license_type_id) errors.license_type_id = 'License type is required';
                    return Object.keys(errors).length > 0 ? errors : null;
                }).filter(Boolean);

                if (licenseErrors.length > 0) {
                    validationErrors.licenses = licenseErrors;
                }
            }

            // Validate permissions
            if (!formData.user_permissions) {
                validationErrors.permissions = 'Permissions are required';
            } else {
                if (!Array.isArray(formData.user_permissions.permission_ids)) {
                    validationErrors.permissions = 'Permission IDs must be an array';
                } else if (formData.user_permissions.permission_ids.length === 0) {
                    validationErrors.permissions = 'At least one permission must be assigned';
                } else {
                    const invalidPermissions = formData.user_permissions.permission_ids.some(id => !Number.isInteger(id));
                    if (invalidPermissions) {
                        validationErrors.permissions = 'Invalid permission IDs';
                    }
                }
            }
        }

        setValidationErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }

    const handleConfirmSubmit = async () => {
        try {
            console.log('Submit State:', {
                rawFormData: formData,
                selectedUserId,
                isEditMode,
                currentStep,
                'user_id in form': formData.user_details.user_id
            });
            
            // Helper function to safely parse integer
            const safeParseInt = (value) => {
                if (value === null || value === undefined || value === '') return null;
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? null : parsed;
            };

            // Get the effective user ID first
            const formDataUserId = safeParseInt(formData.user_details.user_id);
            const selectedUserIdParsed = safeParseInt(selectedUserId);
            const effectiveUserId = formDataUserId || selectedUserIdParsed;
            
            console.log('User ID resolution:', {
                formDataUserId,
                selectedUserIdParsed,
                effectiveUserId,
                isEditMode,
                email: formData.user_details.email_address
            });

            // Check if this is a queue user (email exists but no numeric ID)
            const isQueueUser = isEditMode && !effectiveUserId && formData.user_details.email_address;
            
            // Determine if this should be an edit operation
            const shouldBeEditMode = Boolean(effectiveUserId) || isQueueUser;
            
            if (!shouldBeEditMode) {
                console.log('Creating new user');
            } else if (isQueueUser) {
                console.log('Processing queue user with email:', formData.user_details.email_address);
            } else {
                console.log('Updating existing user with ID:', effectiveUserId);
            }
            
            const payload = {
                user_details: {
                    ...formData.user_details,
                    // Ensure all IDs are properly formatted as integers
                    subsidiary_id: safeParseInt(formData.user_details.subsidiary_id),
                    supervisor_id: safeParseInt(formData.user_details.supervisor_id),
                    // Include user_id for numeric IDs, email for queue users
                    ...(effectiveUserId ? { user_id: effectiveUserId } : {}),
                    ...(isQueueUser ? { email: formData.user_details.email_address } : {})
                },
                user_licenses: formData.user_licenses.map(license => ({
                    module_id: safeParseInt(license.module_id),
                    license_type_id: safeParseInt(license.license_type_id)
                })),
                user_permissions: {
                    set_as_admin: Boolean(formData.user_permissions.set_as_admin),
                    permission_ids: (formData.user_permissions.permission_ids || [])
                        .map(id => safeParseInt(id))
                        .filter(id => id !== null)
                }
            };

            // Remove null values from user_details
            Object.keys(payload.user_details).forEach(key => {
                if (payload.user_details[key] === null) {
                    delete payload.user_details[key];
                }
            });

            // For queue users or edit mode without password
            if ((shouldBeEditMode || isQueueUser) && !payload.user_details.password) {
                delete payload.user_details.password;
            }

            console.log('Final payload:', payload);
            
            if (shouldBeEditMode) {
                if (isQueueUser) {
                    // For queue users, we'll use a special mutation that handles email-based updates
                    console.log('Executing queue user update with email:', formData.user_details.email_address);
                    // You'll need to implement this mutation in users-queries.js
                    await updateUserMutation.mutateAsync({ 
                        userId: formData.user_details.email_address, 
                        formData: payload,
                        isQueueUser: true // Add this flag to help the mutation handler
                    });
                } else {
                    console.log('Executing PUT request with user ID:', effectiveUserId);
                    await updateUserMutation.mutateAsync({ userId: effectiveUserId, formData: payload });
                }
            } else {
                console.log('Executing POST request for new user');
                await addUserMutation.mutateAsync({ formData: payload });
            }
        } catch (error) {
            console.error('Error submitting user:', error);
            handleMutationError(error);
        }
    };

    const steps = [
        { title: 'User Details' },
        { title: 'Licenses & Permissions' },
        { title: 'Review' }
    ];

    return (
        <div className='p-6'>
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-6">
                {steps.map((step, index) => (
                    <div key={index}>
                        <div className={`text-xs ${
                            currentStep > index ? 'text-pink-600 bg-pink-50' :
                            currentStep === index ? 'text-pink-600 bg-pink-50' :
                            'text-gray-400'
                        } px-3 py-1 rounded`}>
                            {step.title}
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Steps */}
            <div className="bg-white rounded-lg p-6">
                {currentStep === 1 && (
                    <AddUserDetailsForm
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        onNext={() => {
                            if (validateStep(1)) {
                                // Ensure isEditMode is set correctly before moving to next step
                                const hasUserId = formData.user_details.user_id || selectedUserId;
                                if (hasUserId) {
                                    setIsEditMode(true);
                                }
                                setCurrentStep(2);
                                setStepsCompleted(Math.max(stepsCompleted, 1));
                            }
                        }}
                        onCancel={() => navigate('/users')}
                        isEditMode={isEditMode}
                        onUserSelect={handleUserSelect}
                        supervisors={supervisors}
                        subsidiaries={subsidiaries}
                    />
                )}
                {currentStep === 2 && (
                    <AssignLicenseAndPermissions
                        formData={formData}
                        setFormData={setFormData}
                        onNext={() => {
                            // Ensure isEditMode is set correctly before moving to next step
                            const hasUserId = formData.user_details.user_id || selectedUserId;
                            if (hasUserId) {
                                setIsEditMode(true);
                            }
                            setCurrentStep(3);
                            setStepsCompleted(Math.max(stepsCompleted, 2));
                        }}
                        onBack={() => setCurrentStep(1)}
                    />
                )}
                {currentStep === 3 && (
                    <AddNewUserReview
                        formData={formData}
                        onBack={() => setCurrentStep(2)}
                        onSubmit={() => setShowConfirmation(true)}
                        supervisors={supervisors}
                        subsidiaries={subsidiaries}
                        isEditMode={isEditMode}
                    />
                )}
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
