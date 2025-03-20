import './VerifyOTPForm.css';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OtpInput from 'react-otp-input';
import Timer from 'easytimer.js';

const WAIT_PERIOD = 60; // number of seconds to wait before user can request new otp

function VerifyOTPForm({ setOtpVerified, setAuthResponse = () => {}, form, type }) {
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState('typing'); // available statuses: typing, submitting
    const [seconds, setSeconds] = useState(WAIT_PERIOD);
    const [resendingOTP, setResendingOTP] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const can_request_otp = seconds == 0;

    const timer = useRef(new Timer());

    useEffect(()=>{
        if (otp.length == 6) {
            handleSubmit();
        }
    }, [otp]);

    if (seconds == WAIT_PERIOD) { // timer has not started, start it
        let timer_instance = timer.current
        timer_instance.start({countdown: true, startValues: {seconds: WAIT_PERIOD}, target: {seconds: 0}});
        timer_instance.addEventListener('secondsUpdated', ()=> {
            setSeconds(Number(timer_instance.getTimeValues().seconds))
        });
    }

    function handleChange(value) {
        validationErrors.otp = null
        setOtp(value)   
    }

    async function handleResendOTP() {
        if (!resendingOTP) {
            setResendingOTP(true);
            let data = {email: form.email}
            try {
                const response = await axios.post('clarion_users/resend_otp/', data);
    
                // otp resent successfully
                setSeconds(WAIT_PERIOD);
                
            } catch (error) {
                setVerificationError(error.response.data.error)
            } finally {
                setResendingOTP(false);
            }
        }
    }

    async function handleSubmit (event = null) {
        event?.preventDefault()

        const validationErrors = {};

        if(!otp) 
            validationErrors.otp = "Please enter your OTP";
        else if(!/^\d{6}$/.test(otp))
            validationErrors.otp = "Please enter a valid OTP";

        if (Object.keys(validationErrors).length > 0) { // if there are validation errors, set validationErrors state and return
            setValidationErrors(validationErrors)
            return;
        }
    
        // proceed with form submission
        setStatus('submitting');

        let data = {
            otp, email: form.email
        }
        try {
            const response = await axios.post('clarion_users/verify_login_otp/', data);

            verificationSuccessful();
            if (type === 'login') setAuthResponse(response.data);
            
        } catch (error) {
            setVerificationError(error.response?.data?.message || 'Unable to verify OTP. Please try again.');
        } finally {
            setStatus('typing');
        }
    } 

    // actions to take when login is successful
    function verificationSuccessful() {
        setVerificationError('');
        setOtpVerified(true);
    }

    const emailDomain = String(form.email).split('@')[1];
    const maskedEmail = String(form.email)[0] + '*'.repeat(form.email.length - 2 - emailDomain.length) + '@' + emailDomain;

    return (
        <form  onSubmit={handleSubmit} className='shadow-xl md:shadow-none w-full p-8 bg-white rounded-xl ring-4 ring-button-pink/50'>

            <div className='text-3xl'>Authentication</div>
            <div className='text-[#4B4B4B] text-sm mt-2'>
                {
                    type === 'login' ?
                    'Complete your login process by entering the 6 digit code sent to ' :
                    'To reset your password enter the 6 digit code sent to '
                } <span className='font-bold'>{maskedEmail}</span>
            </div>

            <div className='space-y-4 mt-4'> {/* fields */}
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
            

            <button type='submit' disabled={status=='submitting'} className={`font-bold w-full p-4 rounded-lg mt-6 text-white ${status=='submitting' ? 'bg-button-pink/70' : 'bg-button-pink'}`} name='submit'>{status == 'submitting' ? 'Please wait...' : 'Confirm'}</button>

            <p className='text-text-gray text-sm mt-6'>Do not share your One time password with anyone. We take your privacy and safety seriously.</p>
        </form>
    )
}

export default VerifyOTPForm;