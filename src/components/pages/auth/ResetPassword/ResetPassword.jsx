import React, { useState } from 'react'
import logo from "../../../../assets/mclarion-logo.svg"
import './ResetPassword.css'
import { get } from 'lockr'
import ResetPasswordForm from '../../../partials/forms/auth/ResetPasswordForm/ResetPasswordForm';
import MessageContext from '../../../../contexts/message-context';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {

    const [resetSuccessful, setResetSuccessful] = useState(false);
    const navigate = useNavigate();

    if (resetSuccessful) navigate('/home');

    const [message, setMessage] = useState(null);

    return (
    <MessageContext.Provider value={{
        message,
        dispatchMessage: (type, text) => setMessage(type === null ? null : { type, text })
    }}>
    <div className="h-full bg-cover md:bg-[url('./assets/images/smiling_lady.jpg')] grid grid-cols-1 lg:grid-cols-2">

        <div className='flex flex-col justify-center items-center'>
        <div className='w-full p-4 max-w-[500px]'>
            <img src={logo}  alt='' className='mb-6 self-start' height={28} width={122} />

            <ResetPasswordForm setResetSuccessful={setResetSuccessful} type={'first-login'} />
            
        </div>
        </div>

    </div>
    </MessageContext.Provider>
    )
}

export default ResetPassword

