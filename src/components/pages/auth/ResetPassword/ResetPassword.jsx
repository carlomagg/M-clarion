import React, { useState, useEffect } from 'react'
import logo from "../../../../assets/mclarion-logo.svg"
import './ResetPassword.css'
import { get } from 'lockr'
import ResetPasswordForm from '../../../partials/forms/auth/ResetPasswordForm/ResetPasswordForm';
import MessageContext from '../../../../contexts/message-context';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../../../../utils/consts';
import { set } from 'lockr';

function ResetPassword() {
    const [resetSuccessful, setResetSuccessful] = useState(false);
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (resetSuccessful) {
            // Get the stored tokens from the first login
            const accessToken = get(ACCESS_TOKEN_NAME);
            const refreshToken = get(REFRESH_TOKEN_NAME);
            
            if (accessToken && refreshToken) {
                // Set the tokens again to ensure they're properly stored
                set(ACCESS_TOKEN_NAME, accessToken);
                set(REFRESH_TOKEN_NAME, refreshToken);
                
                // Redirect to home page
                window.location.href = '/';
            } else {
                // If no tokens found, redirect to login
                navigate('/login');
            }
        }
    }, [resetSuccessful, navigate]);

    return (
        <MessageContext.Provider value={{
            message,
            dispatchMessage: (type, text) => setMessage(type === null ? null : { type, text })
        }}>
            <div className="h-full bg-cover md:bg-[url('./assets/images/smiling_lady.jpg')] grid grid-cols-1 lg:grid-cols-2">
                <div className='flex flex-col justify-center items-center'>
                    <div className='w-full p-4 max-w-[500px]'>
                        <img src={logo} alt='' className='mb-6 self-start' height={28} width={122} />
                        <ResetPasswordForm setResetSuccessful={setResetSuccessful} type={'first-login'} />
                    </div>
                </div>
            </div>
        </MessageContext.Provider>
    )
}

export default ResetPassword

