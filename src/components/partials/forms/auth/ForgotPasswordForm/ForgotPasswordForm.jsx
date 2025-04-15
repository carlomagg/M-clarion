import { useState } from 'react';
import styles from './ForgotPasswordForm.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPasswordForm({ setOtpSent, form, setForm }) {

    const [status, setStatus] = useState('typing'); // available statuses: typing, submitting
    const [networkError, setNetworkError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    function handleChange (event) {
        setValidationErrors({
            ...validationErrors,
            [event.target.name]: null
        })
        setForm(prevForm => {
        return{
            ...prevForm,
            [event.target.name]: event.target.value
        }
        
        })   
    }
    async function handleSubmit (event) {
        event.preventDefault()

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const validationErrors = {};

        if(!form.email.trim()) 
            validationErrors.email = "Please enter your email address";
        else if(!emailRegex.test(form.email))
            validationErrors.email = "Please enter a valid email address";

        if (Object.keys(validationErrors).length > 0) { // if there are validation errors, set validationErrors state and return
            setValidationErrors(validationErrors)
            return;
        }
    
        // proceed with form submission
        setStatus('submitting');
        try {
            const response = await axios.post('clarion_users/user_forgot_password/', form);
            setOtpSent(true);
            
        } catch (error) {
            setNetworkError(error.response.data.error)
        } finally {
            setStatus('typing');
        }
    } 

    // actions to take when login is successful
    function otpSent(response) {
      setNetworkError('');
      setOtpSent(true);
    }

    return (
        <form  onSubmit={handleSubmit} className='shadow-xl md:shadow-none w-full p-8 bg-white rounded-xl ring-4 ring-button-pink/50'>

            <div className='text-3xl'>Forgot Password</div>
            <div className='text-[#4B4B4B] text-sm mt-2'>An OTP will be sent to you to allow you reset your password.</div>

            <div className='space-y-4 mt-4'> {/* fields */}
                {networkError && <div className='text-red-500 font-medium'>{networkError}</div>}
                <div className='space-y-1'>
                    <label className=''>Email</label>
                    <input 
                    type='text'
                    name='email' 
                    className='w-full p-4 rounded-lg outline-button-pink border border-[#666]'
                    onChange={handleChange} 
                    value={form.email} 
                    placeholder='Enter email address'
                    />
                    {validationErrors.email && <div className='text-red-500 text-sm font-medium'>{validationErrors.email}</div>}
            </div>

            </div>

            <p className='mt-6'>
                <Link to='/login'>
                &nbsp;<span className='underline font-semibold decoration-button-pink'>Return to login</span>
                </Link>
            </p>
            

            <button type='submit' disabled={status=='submitting'} className={`font-bold w-full p-4 rounded-lg mt-6 text-white ${status=='submitting' ? 'bg-button-pink/70' : 'bg-button-pink'}`} name='submit'>{status == 'submitting' ? 'Please wait...' : 'Continue'}</button>
        </form>
    )
}

export default ForgotPasswordForm;