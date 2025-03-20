import styles from './EditUserProfile.module.css';
import { useEffect, useState } from 'react';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userOptions, useUpdateUserProfile } from '../../../../queries/users-queries';
import axios from 'axios';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { H3, Field } from '../../../partials/Elements/Elements';
import LoadingIndicatorOne from '../../../partials/skeleton-loading-indicators/LoadingIndicatorOne';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function EditUserProfile() {

    const [searchParams, _] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: ''
    });

    const id = searchParams.get('u');

    const [emailEditable, setEmailEditable] = useState(false);
    const [initialEmail, setInitialEmail] = useState('');
    const [passwordEditable, setPasswordEditable] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    
    // query
    const {isLoading, error, data: user} = useQuery(userOptions(id, queryClient));

    // mutation
    const {mutate, isPending: isUpdatingUser} = useUpdateUserProfile({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = 'Updating user profile';
        (isUpdatingUser) && dispatchMessage('processing', text);
    }, [isUpdatingUser]);
    async function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['users']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled() {
        navigate('/users');
    }
    
    // initialize form when user query data is ready
    useEffect(()=> {
        if (user) {
            const {firstname, lastname, email} = user;
            setFormData({
                firstname: firstname || '', lastname: lastname || '', email
            });
            setInitialEmail(user.email);
        }
    }, [user]);


    function handleChange(event) {
        setValidationErrors({
            ...validationErrors, [event.target.name]: null
        });

        setFormData({
            ...formData, [event.target.name]: event.target.value
        })
    }

    async function validateForm() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,256}$/;

        const validationErrors = {};

        const required_fields = ['firstname', 'lastname', 'email'];

        // run validation checks
        required_fields.forEach(field => {
            if (!formData[field].trim()) validationErrors[field] = "This field is required";
        })

        if(!validationErrors.email && !emailRegex.test(formData.email))
            validationErrors.email = "Please enter a valid email address";

        // check if email is unique if email has been touched
        if (!validationErrors.email && initialEmail !== formData.email) {
            let response = await axios.post('clarion_users/check-email/', {email: formData.email});

            if (!response.data.unique)
                validationErrors.email = "This email address is already taken";

        }

        if(formData.password && !passwordRegex.test(formData.password)) {
            validationErrors.password = "The password must contain a lower case, an upper case, a digit and a special symbol";
        }

        if (Object.keys(validationErrors).length > 0) { // if there are validation errors, set validationErrors state and return
            setValidationErrors(validationErrors)
            return false;
        }

        return true;
    }

    async function handleSubmit() {
        if (!await validateForm()) return;
        mutate({userId: user.user_id, formData})
    }

    if (isLoading) {
        return <LoadingIndicatorOne />
    }

    if (error) {
        return <Error error={error} />
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={`Edit user profile | ${user.firstname ? user.firstname+' '+user.lastname : user.email}`} />
            <PageHeader />
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <div className='text-sm text-text-gray flex items-center justify-stretch gap-3'>
                            <div className='bg-text-pink/15 text-text-pink py-1 px-2 rounded grow flex flex-col items-center cursor-pointer'>
                                User details
                            </div>
                        </div>
                        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
                            <div>
                                <H3>Edit user details</H3>
                                <p>Give to access to your GRC to a new user by editing their user account</p>
                            </div>
                            <div className='flex flex-col gap-2'> {/* first name and last name fields */}
                                <div className='flex gap-6'>
                                    <Field {...{label: 'First name', name: 'firstname', value: formData.firstname, onChange: handleChange, placeholder: 'Enter staff first name', error: validationErrors.firstname}} />
                                    <Field {...{label: 'Last name', name: 'lastname', value: formData.lastname, onChange: handleChange, placeholder: 'Enter staff last name', error: validationErrors.lastname}} />
                                </div>
                            </div>
                            <div className='flex flex-col gap-3'> {/* email field */}
                                <div className='flex justify-between items-center'>
                                    <label htmlFor="email" className='font-medium'>Email address</label>
                                    <span onClick={() => setEmailEditable(!emailEditable)} className='text-sm text-text-pink cursor-pointer mr-8'>Edit</span>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <input id='email' type="email" name='email' value={formData.email} onChange={handleChange} disabled={!emailEditable} placeholder='Enter email address' className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink disabled:bg-[#EBEBEB]' />
                                    {validationErrors.email && <div className='text-sm text-red-500'>{validationErrors.email}</div>}
                                </div>
                            </div>
                            <div className='flex flex-col gap-3'> {/* password field */}
                                <div className='flex justify-between items-center'>
                                    <label htmlFor="password" className='font-medium'>Password</label>
                                    <span onClick={() => setPasswordEditable(!passwordEditable)} className='text-sm text-text-pink cursor-pointer mr-8'>Edit</span>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <input id='password' type="text" name='password' onChange={handleChange} placeholder='******' disabled={!passwordEditable} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink disabled:bg-[#EBEBEB]' />
                                    {validationErrors.password && <div className='text-sm text-red-500'>{validationErrors.password}</div>}
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className='bg-green-100 flex gap-3'>
                        <FormProceedButton text={isUpdatingUser ? 'Saving...' : 'Save'} disabled={isUpdatingUser} onClick={handleSubmit} />
                        <FormCancelButton text={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditUserProfile;