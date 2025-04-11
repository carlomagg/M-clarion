import styles from './Elements.module.css';

import removeIcon from '../../../assets/icons/remove.svg';
import openEyeIcon from '../../../assets/icons/open-eye.svg';
import closedEyeIcon from '../../../assets/icons/closed-eye.svg';
import { useState, useEffect } from 'react';
import CustomCKEditor from '../CKEditor/CKEditor';
import { FaKey } from 'react-icons/fa';
import PasswordEyeIcon from './PasswordEyeIcon';

export function Field({name, label, error = null, value, onChange, placeholder, disabled = false, type='text', height=null}) {
    const [showPassword, setShowPassword] = useState(false);
    const icon = showPassword ? openEyeIcon : closedEyeIcon;

    const generateStrongPassword = () => {
        const length = 12;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*(),.?\":{}|<>";
        
        // Ensure at least one of each required character type
        let password = "";
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill the rest with random characters from all possible characters
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password to ensure the required characters aren't always in the same position
        return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generateStrongPassword();
        const event = {
            target: {
                name: name,
                value: generatedPassword
            }
        };
        onChange(event);
    };
    
    // Auto-generate password when component mounts if it's a password field and empty
    useEffect(() => {
        if (type === 'password' && !value && !disabled && name === 'new_password' && name !== 'confirm_new_password') {
            handleGeneratePassword();
        }
    }, []);

    return (
        <div className='flex flex-col gap-3 flex-1'>
            {label && <label htmlFor={name} className='font-medium'>{label}</label>}
            <div className='flex flex-col gap-2'>
                <div className='relative'>
                    {
                        type === 'text' || type === 'date' || type === 'password' || type === 'number' || type === 'color' ?
                        ( /* text input or date */
                            <input id={name} disabled={disabled} type={type === 'password' && showPassword ? 'text' : type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`placeholder:text-placeholder-gray border border-border-gray rounded-lg ${type !== 'color' ? 'p-3' : 'p-2 h-12'} outline-text-pink disabled:bg-[#EBEBEB] w-full ${type === 'date' && 'border-t-transparent border-x-transparent rounded-none outline-0'} ${type === 'password' && 'pr-24'}`} />
                        ) :
                        (
                            type === 'textbox' &&
                            ( /* textbox */
                                <textarea id={name} disabled={disabled} name={name} value={value} onChange={onChange} placeholder={placeholder} style={{height: height ? height+'px' : '10rem'}} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink resize-none disabled:bg-[#EBEBEB] w-full'></textarea>
                            )
                        )
                    }
                    {
                        type === 'password' &&
                        (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                                <PasswordEyeIcon
                                    showPassword={showPassword}
                                    toggleShowPassword={() => setShowPassword(!showPassword)}
                                />
                                {name === 'new_password' && (
                                    <button
                                        type="button"
                                        onClick={handleGeneratePassword}
                                        className="text-pink-600 hover:text-pink-700 text-xs font-medium flex items-center gap-1"
                                    >
                                        <FaKey size={12} />
                                        Auto Generate
                                    </button>
                                )}
                            </div>
                        )
                    }
                </div>
                {error && <div className='text-sm text-red-500'>{error}</div>}
            </div>
        </div>
    );
}

export function CKEField({name, label, error = null, value, onChange}) {
    return (
        <div className='flex flex-col gap-3 flex-1'>
            <label htmlFor={name} className='font-medium'>{label}</label>
            <div className='flex flex-col gap-2 relative'>
                <CustomCKEditor {...{name, value, onChange}} />
                {error && <div className='text-sm text-red-500'>{error}</div>}
            </div>
        </div>
    );
}


// export function Field2({name, label, error = null, value, onChange, placeholder, disabled = false, type='text', height=null}) {
//     return (
//         <div className='flex flex-col gap-3 flex-1 min-w-[150px] '>
//             <label htmlFor={name} className='font-medium'>{label}</label>
//             <div className='flex flex-col gap-2'>
//                 {
//                     type === 'text' || type === 'date' ?
//                     ( /* text input or date */
//                         <input id={name} disabled={disabled} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink disabled:bg-[#EBEBEB]' />
//                     ) :
//                     ( /* textbox */
//                         <textarea id={name} disabled={disabled} name={name} value={value} onChange={onChange} placeholder={placeholder} style={height && {height:height+'px'}} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink resize-none disabled:bg-[#EBEBEB]'></textarea>
//                     )
//                 }
//                 {error && <div className='text-sm text-red-500'>{error}</div>}
//             </div>
//         </div>
//     );
// }

export function PasswordField({label, name, value, onChange, placeholder, error}) {
    const [showPassword, setShowPassword] = useState(false);
    const type = showPassword ? 'text' : 'password';

    const generateStrongPassword = () => {
        const length = 12;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*(),.?\":{}|<>";
        
        // Ensure at least one of each required character type
        let password = "";
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill the rest with random characters from all possible characters
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password to ensure the required characters aren't always in the same position
        return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generateStrongPassword();
        const event = {
            target: {
                name: name,
                value: generatedPassword
            }
        };
        onChange(event);
    };
    
    // Auto-generate password when component mounts if it's empty
    useEffect(() => {
        // Disable auto-generation for ResetPasswordForm fields
        const skipAutoGeneration = name === 'confirm_new_password';
        if (!value && !skipAutoGeneration) {
            handleGeneratePassword();
        }
    }, []);

    return (
        <div className='space-y-1'>
            <label className=''>{label}</label>
            <div className='relative'>
                <input 
                type={type}
                name={name} 
                className='w-full p-4 pr-24 rounded-lg outline-button-pink border border-[#666]'
                onChange={onChange} 
                value={value} 
                placeholder={placeholder}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                    <PasswordEyeIcon
                        showPassword={showPassword}
                        toggleShowPassword={() => setShowPassword(!showPassword)}
                    />
                    {name === 'new_password' && (
                        <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="text-pink-600 hover:text-pink-700 text-xs font-medium flex items-center gap-1"
                        >
                            <FaKey size={12} />
                            Auto Generate
                        </button>
                    )}
                </div>
            </div>
            {error && <div className='text-red-500 text-sm font-medium'>{error}</div>}
        </div>
    );
}

export function Input({name, error = null, disabled = false, value, onChange, placeholder}) {
    return (
        <div className='flex flex-col gap-2'>
            <input id={name} type="text" name={name} disabled={disabled} value={value} onChange={onChange} placeholder={placeholder} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink disabled:bg-[#EBEBEB]' />
            {error && <div className='text-sm text-red-500'>{error}</div>}
        </div>
    );
}

export function Textbox({name, error = null, value, onChange, disabled=false, placeholder, height=null}) {
    return (
        <div className='flex flex-col gap-2'>
            <textarea id={name} name={name} value={value} disabled={disabled} onChange={onChange} placeholder={placeholder} style={height && {height:height+'px'}} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink resize-none disabled:bg-[#EBEBEB]'></textarea>
            {error && <div className='text-sm text-red-500'>{error}</div>}
        </div>
    );
}

export function H2({children}) {
    return (
        <h2 className='text-2xl font-semibold'>
            {children}
        </h2>
    );
}

export function H3({children}) {
    return (
        <h3 className='text-xl font-semibold'>
            {children}
        </h3>
    );
}

export function Chip({text, onRemove}) {
    return (
        <div className='py-1 px-2 w-fit bg-[#CDE1FF] relative rounded font-medium text-[11px] text-[#4182E4] border border-[#4182E4]'>
            <button type='button' onClick={(e) => {e.stopPropagation(); onRemove()}} className='rounded-full absolute top-0 right-0 -translate-y-1/2 translate-x-1/2'>
                <img src={removeIcon} alt="" />
            </button>
            {text}
        </div>
    )
}