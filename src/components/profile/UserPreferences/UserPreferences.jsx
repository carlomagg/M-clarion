import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../partials/buttons/FormButtons/FormButtons';
import { Field, H3, Input } from '../../partials/Elements/Elements';
import styles from './UserPreferences.module.css';
import { useUpdatePreferences, useChangePassword } from '../../../queries/users-queries';
import useUser from '../../../hooks/useUser';
import allowedIcon from '../../../assets/icons/encircled-check.svg';
import useDispatchMessage from '../../../hooks/useDispatchMessage';
import ActionsDropdown from '../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { set } from 'lockr';
import { PenSquare } from 'lucide-react';
import auth from '../../../utils/auth';

// Password generation function
const generateStrongPassword = () => {
    const length = 12;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    // Use the same special characters as the validation pattern in AddNewUser.jsx
    const symbols = "!@#$%^&*(),.?\":{}|<>";
    
    // Ensure at least one of each required character type
    let password = "";
    // Add one lowercase
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    // Add one uppercase
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    // Add one number
    password += numbers[Math.floor(Math.random() * numbers.length)];
    // Add one special character from the validation-approved list
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters from all possible characters (no spaces)
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to ensure the required characters aren't always in the same position
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

function UserPreferences({ initialMode = 'view', onClose }) {
    const [mode, setMode] = useState(initialMode);

    const actions = [
        {text: 'Edit', type: 'action', onClick: () => setMode('edit')}
    ];

    return (
        <div className='px-8 py-6'>
            <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-2'>
                {
                    mode === 'view' &&
                    <div className='text-end'>
                        <ActionsDropdown label={'Actions'} items={actions} />
                    </div>
                }
                {
                    mode === 'edit' ?
                    <EditMode onClose={onClose} /> :
                    <ViewMode />
                }
            </div>
        </div>
    );
}

function ViewMode() {
    const user = useUser();

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex gap-6'>
                <div className='flex flex-col gap-3 flex-1'>
                    <span className='font-semibold'>First name</span>
                    <span>{user.firstName}</span>
                </div>
                <div className='flex flex-col gap-3 flex-1'>
                    <span className='font-semibold'>Last name</span>
                    <span>{user.lastName}</span>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                <span className='font-semibold'>Email</span>
                <span>{user.email}</span>
            </div>
        </div>
    );
}

function EditMode({ onClose }) {
    const user = useUser();
    const [isFirstMount, setIsFirstMount] = useState(true);
    const [isFormEdited, setIsFormEdited] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });

    // track if form has been edited
    useEffect(() => {
        if (isFirstMount) {
            setIsFirstMount(false);
            return;
        }

        const isFormEdited = formData.first_name !== user.firstName ||
        formData.last_name !== user.lastName ||
        formData.old_password !== '' ||
        formData.new_password !== '' ||
        formData.confirm_new_password !== '';

        setIsFormEdited(isFormEdited);
    }, [formData]);
    
    // Always show password fields
    const [editPassword, setEditPassword] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});
    const [permissionListIsCollapsed, setPermissionListIsCollapsed] = useState(true);

    // Don't generate password when user decides to edit password - let the Field component handle it
    useEffect(() => {
        // Just track if edit password was clicked
        if (editPassword) {
            console.log("Edit password mode activated");
        }
    }, [editPassword]);

    const {isPending: isUpdatingUser, mutate: updatePreferences} = useUpdatePreferences({
        onSuccess: onUpdateSuccess,
        onError: onUpdateError
    });
    
    const {isPending: isChangingPassword, mutate: changePassword} = useChangePassword({
        onSuccess: onPasswordSuccess,
        onError: onPasswordError
    });
    
    const dispatchMessage = useDispatchMessage();

    useEffect(() => {
        if (isUpdatingUser) {
            dispatchMessage('processing', 'Updating your profile...');
        } else if (isChangingPassword) {
            dispatchMessage('processing', 'Changing your password...');
        }
    }, [isUpdatingUser, isChangingPassword]);

    function onUpdateSuccess(data) {
        dispatchMessage('success', data.message || 'Profile updated successfully');
    }

    function onUpdateError(error) {
        const errorMessage = error.response?.data?.message || 'Failed to update profile';
        dispatchMessage('failed', errorMessage);
    }

    function onPasswordSuccess(data) {
        dispatchMessage('success', 'password change successfully');
        setFormData({
            ...formData,
            old_password: '',
            new_password: '',
            confirm_new_password: ''
        });
        setEditPassword(false);
    }

    function onPasswordError(error) {
        const errorMessage = error.response?.data?.message || 'Failed to change password';
        dispatchMessage('failed', errorMessage);
        
        if (error.response?.data?.errors) {
            setValidationErrors({
                ...validationErrors,
                ...error.response.data.errors
            });
        }
    }

    function handleChange(e) {
        setValidationErrors({
            ...validationErrors,
            [e.target.name]: null
        });

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate password if changing
            if (formData.new_password && formData.confirm_new_password) {
                // Use the same validation as in AddNewUser.jsx
                const hasNumber = /\d/.test(formData.new_password);
                const hasLower = /[a-z]/.test(formData.new_password);
                const hasUpper = /[A-Z]/.test(formData.new_password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password);
                const hasNoSpaces = !/\s/.test(formData.new_password);
                const isLongEnough = formData.new_password.length >= 8;

                if (!(hasNumber && hasLower && hasUpper && hasSpecial && hasNoSpaces && isLongEnough)) {
                    dispatchMessage('failed', 'Password must contain at least one number, one lowercase letter, one uppercase letter, one special character, no spaces, and be at least 8 characters');
                    return;
                }

                if (formData.new_password !== formData.confirm_new_password) {
                    dispatchMessage('failed', 'Passwords do not match');
                    return;
                }
            }

            // Always send all fields to the endpoint
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                old_password: formData.old_password,
                new_password: formData.new_password,
                confirm_new_password: formData.confirm_new_password
            };

            // Call the API to update preferences
            await updatePreferences({
                data: payload
            });
            
            // Get current user data directly from auth to ensure we have all properties
            const currentUser = auth.getUser();
            
            // Update only the name properties, preserving everything else
            const updatedUser = {
                ...currentUser,
                firstName: formData.first_name,
                lastName: formData.last_name
            };
            
            // Update the user data in the auth context
            auth.setUser(updatedUser);
            
            // Force a UI refresh to display the updated user info immediately
            window.dispatchEvent(new Event('user:updated'));
        } catch (error) {
            console.error('Error updating preferences:', error);
            dispatchMessage('failed', error.response?.data?.message || error.message || 'Failed to update preferences');
        }
    };

    const permissionItems = Array.from(user.permissions).map(perm => {
        return (
            <li key={perm} className='flex gap-2 items-center'>
                <img src={allowedIcon} alt="" />
                <span className={styles['capitalizeFirstLetter']}>{String(perm).replace(/_/g, ' ')}</span>
            </li>
        )
    })

    return (
        <div className='flex flex-col gap-4'>
            <form className='flex flex-col gap-3'>
                <div className='flex gap-6'>
                    <Field label={'First name'} name={'first_name'} value={formData.first_name} onChange={handleChange} error={validationErrors.first_name} placeholder={'First name'} />
                    <Field label={'Last name'} name={'last_name'} value={formData.last_name} onChange={handleChange} error={validationErrors.last_name} placeholder={'Last name'} />
                </div>
                <Field label={'Email'} name={'email'} value={user.email} placeholder={'Email'} disabled={true} />
                <div className='flex flex-col gap-2'>
                    <EditPasswordFields {...{formData, handleChange, validationErrors, setValidationErrors}} />
                </div>
            </form>
            <div className='grid grid-cols-2 gap-6 mt-2 max-w-md'>
                <FormCancelButton text={'Cancel'} colorBlack={true} onClick={onClose} />
                <FormProceedButton text={isUpdatingUser ? 'Saving...' : 'Save'} onClick={handleSubmit} disabled={!isFormEdited || isUpdatingUser} />
            </div>
        </div>
    );
}

function EditPasswordFields({formData, handleChange, validationErrors}) {
    const [passwordStrength, setPasswordStrength] = useState('');

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

    const handlePasswordChange = (e) => {
        setPasswordStrength(checkPasswordStrength(e.target.value));
        handleChange(e);
    };

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex flex-col gap-1'>
                <Field 
                    label={'Old password'} 
                    name={'old_password'} 
                    value={formData.old_password} 
                    onChange={handleChange} 
                    error={validationErrors.old_password} 
                    type={'password'} 
                    placeholder={'Enter old password'} 
                />
            </div>
            <div className='flex flex-col gap-1'>
                <Field 
                    label={'New password'} 
                    name={'new_password'} 
                    value={formData.new_password} 
                    onChange={handlePasswordChange} 
                    error={validationErrors.new_password} 
                    type={'password'} 
                    placeholder={'Enter new password'} 
                />
                {formData.new_password && (
                    <>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                            <div className={`h-full transition-all duration-300 ${
                                passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                                passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                                'w-full bg-green-500'
                            }`} />
                        </div>
                        <p className={`text-xs mt-1 ${
                            passwordStrength === 'weak' ? 'text-red-500' :
                            passwordStrength === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                        }`}>
                            Password strength: {passwordStrength}
                        </p>
                    </>
                )}
                <p className='text-[10px] text-gray-400'>
                    Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, one special character, and no spaces
                </p>
            </div>
            <div className='flex flex-col gap-1'>
                <Field 
                    label={'Re-enter new password'} 
                    type={'password'} 
                    name={'confirm_new_password'} 
                    value={formData.confirm_new_password} 
                    onChange={handleChange} 
                    error={validationErrors.confirm_new_password} 
                    placeholder={'Confirm new password'} 
                />
            </div>
        </div>
    ); 
}

export default UserPreferences;