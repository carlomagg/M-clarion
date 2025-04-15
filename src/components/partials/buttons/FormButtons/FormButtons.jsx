import { useNavigate } from 'react-router-dom';
import styles from './FormButtons.module.css';

function Button({text, colorString, onClick = null, disabled = false}) {
    return (
        <button type="button" disabled={disabled} onClick={onClick} className={`${colorString} py-3 rounded-lg font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap`}>
            {text}
        </button>
    );
}

export function FormCancelButton({text, onClick = null}) {
    const navigate = useNavigate();
    function handleClick() {
        if (onClick && typeof onClick === 'function')
            onClick();
        else
            // navigate to the previous page by default
            navigate(-1)
    }
    return <Button {...{text, onClick: handleClick, colorString: 'bg-[#C3C3C3] text-black'}} />
}

export function FormProceedButton({text, onClick, disabled}) {
    return <Button {...{text, onClick, disabled, colorString: 'bg-[#FF00FF] disabled:bg-[#FF00FF]/70 text-white'}} />
}

export function NewUserButton({text, onClick, disabled, isLoading}) {
    return (
        <button 
            type="button" 
            disabled={disabled} 
            onClick={onClick} 
            className="flex items-center gap-2 py-2 px-6 bg-[#FF00FF] border border-[#FF00FF] rounded-lg shadow-sm hover:bg-[#FF00FF]/90 disabled:opacity-70 text-sm min-w-[140px] justify-center text-white"
        >
            <span className="text-white font-bold text-lg">+</span>
            {isLoading ? 'Adding...' : text}
        </button>
    );
}

export function WhiteButton({text, onClick, disabled}) {
    return (
        <button 
            type="button" 
            disabled={disabled} 
            onClick={onClick} 
            className="flex items-center gap-2 py-2 px-6 bg-[#C3C3C3] border border-[#EBEBEB] rounded-lg shadow-sm hover:bg-gray-300 disabled:opacity-70 text-sm min-w-[140px] justify-center"
        >
            {text}
        </button>
    );
}

export function FormCustomButton({text, onClick, disabled, color = 'gray'}) {
    const colorStrings = {
        gray: 'bg-[#C3C3C3] text-black',
        white: 'bg-white text-black',
        pink: 'bg-[#E44195] text-white'
    };
    return <Button {...{text, onClick, disabled, colorString: colorStrings[color]}} />
}