import './VerifyOTPForm.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OtpInput from 'react-otp-input';
import Timer from 'easytimer.js';

const WAIT_PERIOD = 60; // number of seconds to wait before user can request new otp

function VerifyOTPForm({ setOtpVerified, setAuthResponse = () => {}, form, type }) {
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState('typing');
    const [seconds, setSeconds] = useState(WAIT_PERIOD);
    const [resendingOTP, setResendingOTP] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const can_request_otp = seconds === 0;
    const timer = useRef(new Timer());

    const verificationSuccessful = useCallback(() => {
        setVerificationError('');
        setOtpVerified(true);
    }, [setOtpVerified]);

    const handleSubmit = useCallback(async (event = null) => {
        if (isSubmitting) return;
        
        event?.preventDefault();

        const validationErrors = {};

        if(!otp) 
            validationErrors.otp = "Please enter your OTP";
        else if(!/^\d{6}$/.test(otp))
            validationErrors.otp = "Please enter a valid OTP";

        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors)
            return;
        }
    
        setIsSubmitting(true);
        setStatus('submitting');

        let data = {
            otp, email: form.email
        }
        try {
            const endpoint = type === 'forgot_password' 
                ? 'clarion_users/verify_forgot_password_otp/'
                : 'clarion_users/verify_login_otp/';
                
            const response = await axios.post(endpoint, data);

            verificationSuccessful();
            if (type === 'login') setAuthResponse(response.data);
            
        } catch (error) {
            setVerificationError(error.response?.data?.message || 'Unable to verify OTP. Please try again.');
        } finally {
            setStatus('typing');
            setIsSubmitting(false);
        }
    }, [otp, form.email, type, verificationSuccessful, setAuthResponse, isSubmitting]);

    useEffect(() => {
        if (otp.length === 6 && !isSubmitting) {
            handleSubmit();
        }
    }, [otp, handleSubmit, isSubmitting]);

    useEffect(() => {
        if (seconds === WAIT_PERIOD) {
            let timer_instance = timer.current;
            timer_instance.start({
                countdown: true,
                startValues: {seconds: WAIT_PERIOD},
                target: {seconds: 0}
            });
            timer_instance.addEventListener('secondsUpdated', () => {
                setSeconds(Number(timer_instance.getTimeValues().seconds));
            });
        }
    }, [seconds]);

    const handleChange = useCallback((value) => {
        setValidationErrors(prev => ({ ...prev, otp: null }));
        setOtp(value);
    }, []);

    const handleResendOTP = useCallback(async () => {
        if (!resendingOTP) {
            setResendingOTP(true);
            let data = {email: form.email}
            try {
                await axios.post('clarion_users/resend_otp/', data);
                setSeconds(WAIT_PERIOD);
            } catch (error) {
                setVerificationError(error.response.data.error)
            } finally {
                setResendingOTP(false);
            }
        }
    }, [resendingOTP, form.email]);

    const emailDomain = String(form.email).split('@')[1];
    const maskedEmail = String(form.email)[0] + '*'.repeat(form.email.length - 2 - emailDomain.length) + '@' + emailDomain;

    return (
        <form onSubmit={handleSubmit} className='shadow-xl md:shadow-none w-full p-8 bg-white rounded-xl ring-4 ring-button-pink/50'>
            <div className='text-3xl'>Authentication</div>
            <div className='text-[#4B4B4B] text-sm mt-2'>
                {
                    type === 'login' ?
                    'Complete your login process by entering the 6 digit code sent to ' :
                    'To reset your password enter the 6 digit code sent to '
                } <span className='font-bold'>{maskedEmail}</span>
            </div>

            <div className='space-y-4 mt-4'>
                {verificationError && <div className='text-red-500 font-medium'>{verificationError}</div>}
                <div className='space-y-1'>
                    <label className=''>Enter one time password</label>
                    <OtpInput
                        value={otp}
                        onChange={handleChange}
                        numInputs={6}
                        renderSeparator={<span className='spacer'></span>}
                        renderInput={(props) => <input {...props} />}
                        inputStyle={"otp-code"}
                    />
                    {validationErrors.otp && <div className='text-red-500 text-sm font-medium'>{validationErrors.otp}</div>}
                </div>
            </div>

            <p className='mt-6'>
                Didn't receive OTP?{" "}
                {
                    can_request_otp ?
                    <span onClick={handleResendOTP} className='font-semibold underline decoration-button-pink cursor-pointer'>Resend OTP</span> :
                    <span className='font-semibold underline decoration-button-pink cursor-default'>Resend in {seconds} seconds</span>
                }
            </p>

            <button 
                type='submit' 
                disabled={status === 'submitting' || isSubmitting} 
                className={`font-bold w-full p-4 rounded-lg mt-6 text-white ${(status === 'submitting' || isSubmitting) ? 'bg-button-pink/70' : 'bg-button-pink'}`} 
                name='submit'
            >
                {(status === 'submitting' || isSubmitting) ? 'Please wait...' : 'Confirm'}
            </button>

            <p className='text-text-gray text-sm mt-6'>Do not share your One time password with anyone. We take your privacy and safety seriously.</p>
        </form>
    )
}

export default VerifyOTPForm;