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
    
    const [editPassword, setEditPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [permissionListIsCollapsed, setPermissionListIsCollapsed] = useState(true);

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
            dispatchMessage('processing', 'Updating your preferences...');
        } else if (isChangingPassword) {
            dispatchMessage('processing', 'Changing your password...');
        }
    }, [isUpdatingUser, isChangingPassword]);

    function onUpdateSuccess(data) {
        dispatchMessage('success', data.message || 'Profile updated successfully');
        onClose();
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
        onClose();
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
                if (!formData.new_password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
                    dispatchMessage('failed', 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character');
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

            await updatePreferences({
                data: payload
            });
            
            // Update the user data in the auth context
            const updatedUser = {
                ...user,
                firstName: formData.first_name,
                lastName: formData.last_name
            };
            auth.setUser(updatedUser);
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
                    {
                        editPassword ?
                        <EditPasswordFields {...{formData, handleChange, validationErrors, setValidationErrors}} /> :
                        (
                            <div className='flex flex-col gap-2'>
                                <div className='flex justify-between items-center'>
                                    <label htmlFor="password" className='font-medium'>Password</label>
                                    <button onClick={() => setEditPassword(true)} className='p-1 hover:bg-gray-100 rounded mr-8'>
                                        <PenSquare size={14} className="text-[#FF69B4]" />
                                    </button>
                                </div>
                                <Input name={'password'} type={'password'} placeholder={'***********'} disabled={true} />
                            </div>
                        )
                    }
                </div>
            </form>
            <div className='flex gap-6 mt-2'>
                <FormCancelButton text={'Cancel'} colorBlack={true} onClick={onClose} />
                <FormProceedButton text={isUpdatingUser ? 'Saving changes...' : 'Save changes'} onClick={handleSubmit} disabled={!isFormEdited || isUpdatingUser} />
            </div>
        </div>
    );
}

function EditPasswordFields({formData, handleChange, validationErrors}) {
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
                    onChange={handleChange} 
                    error={validationErrors.new_password} 
                    type={'password'} 
                    placeholder={'Enter new password'} 
                />
                <p className='text-[10px] text-gray-400'>
                    Password must be between 8-256 character and use a combination of at least uppercase, lowercase, numbers and symbols
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