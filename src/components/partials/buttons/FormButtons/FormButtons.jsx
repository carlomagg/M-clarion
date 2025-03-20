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
    return <Button {...{text, onClick, disabled, colorString: 'bg-button-pink disabled:bg-button-pink/70 text-white'}} />
}

export function FormCustomButton({text, onClick, disabled, color = 'gray'}) {
    const colorStrings = {
        gray: 'bg-[#C3C3C3] text-black',
        white: 'bg-white text-black',
        pink: 'bg-[#E44195] text-white'
    };
    return <Button {...{text, onClick, disabled, colorString: colorStrings[color]}} />
}