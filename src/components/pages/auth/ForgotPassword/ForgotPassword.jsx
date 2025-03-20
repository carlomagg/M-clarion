import './ForgotPassword.css';
import React, { useState } from 'react'
import logo from "../../../../assets/mclarion-logo.jpg"
import ForgotPasswordForm from '../../../partials/forms/auth/ForgotPasswordForm/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';
import VerifyOTPForm from '../../../partials/forms/auth/VerifyOTPForm/VerifyOTPForm';
import ResetPasswordForm from '../../../partials/forms/auth/ResetPasswordForm/ResetPasswordForm';

function ForgotPassword() {
    const [form, setForm] = useState({
        email: "",
    });
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [resetSuccessful, setResetSuccessful] = useState(false);
    const navigate = useNavigate();

    if (resetSuccessful) {
        alert('reset sus')
        navigate('/login');
    }

    return (
        <div className="h-full bg-cover md:bg-[url('./assets/images/smiling_lady.jpg')] grid grid-cols-1 lg:grid-cols-2">
    
          <div className='flex flex-col justify-center items-center'>
            <div className='w-full p-4 max-w-[500px]'>
              <img src={logo}  alt='' className='mb-6 self-start' height={28} width={122}/>
    
                {
                    !otpSent ? 
                    <ForgotPasswordForm {...{setForm, form, setOtpSent}} /> :
                    (
                        !otpVerified ?
                        <VerifyOTPForm setOtpVerified={setOtpVerified} type={'forgot-password'} form={form} /> :
                        <ResetPasswordForm setResetSuccessful={setResetSuccessful} type={'forgot-password'} email={form.email} />
                    )
                }
            </div>
          </div>
    
        </div>
      )
}

export default ForgotPassword;