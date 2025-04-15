import React, { useEffect, useState } from 'react'
import logo from "../../../../assets/mclarion-logo.jpg"
import './Login.css'
import LoginForm from '../../../partials/forms/auth/LoginForm/LoginForm'
import VerifyOTPForm from '../../../partials/forms/auth/VerifyOTPForm/VerifyOTPForm'
import { set } from 'lockr'
import { useNavigate, useLocation } from 'react-router-dom'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../../../../utils/consts'

function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loginResponse, setLoginResponse] = useState(null); // filled after user login (only used in case of super admin)
    const [authResponse, setAuthResponse] = useState(null); // filled after opt verification
    const navigate = useNavigate();
    const location = useLocation();

    // authenticate super user immediately after login without needing to verify otp
    useEffect(() => {
        if (isLoggedIn && loginResponse?.access) {
            authenticateUser(loginResponse);
        }
    }, [isLoggedIn, loginResponse]);

    // authenticate user after otp verification
    useEffect(() => {
        if (otpVerified && authResponse) {
            authenticateUser(authResponse);
        }
    }, [otpVerified, authResponse]);

    function authenticateUser({access, refresh, expiresIn, isfirst = false}) {
        // authenticate user (store access and refresh tokens) and redirect to dashboard
        // if super user, called after login
        // if regualar user called when otp has been verified to set access and refresh tokens sent from server

        set(ACCESS_TOKEN_NAME, access);
        set(REFRESH_TOKEN_NAME, {'token': refresh, 'expiry': expiresIn});

        if (isfirst) navigate('/reset-password');
        else {
            document.location = '/';
        }
    }

    const isSuperUser = isLoggedIn && loginResponse?.access;

    return (
        <div className="h-full bg-cover md:bg-[url('./assets/images/smiling_lady.jpg')] grid grid-cols-1 lg:grid-cols-2">
            <div className='flex flex-col justify-center items-center'>
                <div className='w-full p-4 max-w-[500px] bg-white rounded-lg shadow-md border-2 border-pink-500'>
                    <img src={logo} alt='' className='mb-6 self-start' height={28} width={122}/>
                    {
                        (!isLoggedIn || isSuperUser) ?
                        <LoginForm {...{setForm, form, setIsLoggedIn, setLoginResponse}} /> :
                        (
                            !isSuperUser &&
                            <VerifyOTPForm setOtpVerified={setOtpVerified} type={'login'} setAuthResponse={setAuthResponse} form={form} />
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Login;
