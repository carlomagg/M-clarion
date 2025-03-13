import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../partials/buttons/FormButtons/FormButtons';
import { Field, H3, Input } from '../../partials/Elements/Elements';
import styles from './UserPreferences.module.css';
import { useUpdatePreferences } from '../../../queries/users-queries';
import useUser from '../../../hooks/useUser';
import allowedIcon from '../../../assets/icons/encircled-check.svg';
import useDispatchMessage from '../../../hooks/useDispatchMessage';
import ActionsDropdown from '../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { set } from 'lockr';
import { PenSquare } from 'lucide-react';

function UserPreferences() {
    const [mode, setMode] = useState('view');

    const actions = [
        {text: 'Edit', type: 'action', onClick: () => setMode('edit')}
    ];

    return (
        <div className='px-8 py-6 h-full overflow-auto'>
            <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-2'>
                {
                    mode === 'view' &&
                    <div className='text-end'>
                        <ActionsDropdown label={'Actions'} items={actions} />
                    </div>
                }
                {
                    mode === 'edit' ?
                    <EditMode showViewMode={() => setMode('view')} /> :
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

function EditMode({ showViewMode }) {
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

    const {isPending: isUpdatingUser, mutate} = useUpdatePreferences({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();

    useEffect(() => {
        (isUpdatingUser) && dispatchMessage('processing', 'Updating your preferences')
    }, [isUpdatingUser]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
    }

    function handleChange(e) {
        setValidationErrors({
            ...validationErrors, [e.target.name]: null
        });

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    
    function handleSubmit() {
        if (formData.old_password) {
            const validationErrors = {};
            // check password validity if old password was input
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,256}$/;
    
            const passwordIsValid = passwordRegex.test(formData.new_password);
            
            if (!passwordIsValid) validationErrors.new_password = 'Password must meet all criteria specified below.';
            if (passwordIsValid && (formData.new_password !== formData.confirm_new_password)) validationErrors.confirm_new_password = 'Passwords do not match.';

            // if there are any validation errors, abort submit
            if (Object.keys(validationErrors).length > 0) {
                setValidationErrors(validationErrors);
                return false;
            };
        }


        mutate({data: formData});
    }

    const permissionItems = Array.from(user.permissions).map(perm => {
        return (
            <li key={perm} className='flex gap-2 items-center'>
                <img src={allowedIcon} alt="" />
                <span className={styles['capitalizeFirstLetter']}>{String(perm).replace(/_/g, ' ')}</span>
            </li>
        )
    })

    return (
        <div className='flex flex-col gap-8'>
            <form className='flex flex-col gap-6'>
                <div className='flex gap-6'>
                    <Field label={'First name'} name={'first_name'} value={formData.first_name} onChange={handleChange} error={validationErrors.first_name} placeholder={'First name'} />
                    <Field label={'Last name'} name={'last_name'} value={formData.last_name} onChange={handleChange} error={validationErrors.last_name} placeholder={'Last name'} />
                </div>
                <Field label={'Email'} name={'email'} value={user.email} placeholder={'Email'} disabled={true} />
                {
                    editPassword ?
                    <EditPasswordFields {...{formData, handleChange, validationErrors, setValidationErrors}} /> :
                    (
                        <div className='flex flex-col gap-3'>
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
                {/* <hr className='h-[1px] bg-[#D0D0D0]' />
                <div className='flex flex-col gap-4'>
                    <h4 className='text-lg font-semibold grow'>Permissions</h4>
                    <div className='flex flex-col gap-3'>
                        <div className='bg-[#DEDEDE] rounded-t-lg py-5 px-4 flex'>
                            <span className='font-semibold grow'>Permissions</span>
                            <div className='pr-5 flex gap-2 cursor-pointer items-center' onClick={() => setPermissionListIsCollapsed(!permissionListIsCollapsed)}>
                                <span className='text-sm text-text-pink'>{permissionListIsCollapsed ? 'Expand' : 'Collapse'}</span>
                                <img src={chevronDownIcon} className={permissionListIsCollapsed ? '' : 'rotate-180'} alt="icon" />
                            </div>
                        </div>
                        <div className={`${permissionListIsCollapsed ? 'max-h-0' : 'max-h-none'} overflow-hidden `}>
                            <ul className='px-6 flex flex-col gap-4'>
                                {permissionItems}
                            </ul>
                        </div>
                    </div>
                </div> */}
            </form>
            <div className='flex gap-6'>
                <FormCancelButton text={'Cancel'} colorBlack={true} onClick={showViewMode} />
                <FormProceedButton text={isUpdatingUser ? 'Saving changes...' : 'Save changes'} onClick={handleSubmit} disabled={!isFormEdited || isUpdatingUser} />
            </div>
        </div>
    );
}

function EditPasswordFields({formData, handleChange, validationErrors}) {
    return (
        <div className='flex flex-col gap-6'>
            <Field label={'Old password'} name={'old_password'} value={formData.old_password} onChange={handleChange} error={validationErrors.old_password} type={'password'} placeholder={'Enter old password'} />
            <div>
                <Field label={'New password'} name={'new_password'} value={formData.new_password} onChange={handleChange} error={validationErrors.new_password} type={'password'} placeholder={'Enter new password'} />
                <p className='italic text-text-gray text-sm mt-2'>
                    Password must be between 8-256 character and use a combination of at least uppercase, lowercase, numbers and symbols
                </p>
            </div>
            <Field label={'Re-enter new password'} type={'password'} name={'confirm_new_password'} value={formData.confirm_new_password} onChange={handleChange} error={validationErrors.confirm_new_password} placeholder={'Confirm new password'} />
        </div>
    ); 
}

export default UserPreferences;