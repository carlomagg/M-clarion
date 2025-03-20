import React, { useState } from 'react'
import logo from "../../../../assets/mclarion-logo.svg"
import './ResetPassword.css'
import { get } from 'lockr'
import ResetPasswordForm from '../../../partials/forms/auth/ResetPasswordForm/ResetPasswordForm';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {

    const [resetSuccessful, setResetSuccessful] = useState(false);
    const navigate = useNavigate();

    if (resetSuccessful) navigate('/home');

    return (
    <div className="h-full bg-cover md:bg-[url('./assets/images/smiling_lady.jpg')] grid grid-cols-1 lg:grid-cols-2">

        <div className='flex flex-col justify-center items-center'>
        <div className='w-full p-4 max-w-[500px]'>
            <img src={logo}  alt='' className='mb-6 self-start' height={28} width={122} />

            <ResetPasswordForm setResetSuccessful={setResetSuccessful} type={'first-login'} />
            
        </div>
        </div>

    </div>
    )
}

export default ResetPassword

