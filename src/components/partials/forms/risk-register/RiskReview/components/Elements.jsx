import { useState } from "react";
import chevronIcon from '../../../../../../assets/icons/chevron-black.svg';
import minimizeIcon from '../../../../../../assets/icons/minimize.svg';

export function Tag({type, text}) {
    return (
        <span className={`rounded-full ${type === 'id' ? 'bg-[#FFD3D8] text-[#C01E1E] text-sm font-medium px-2 py-1' : 'bg-[#E2E2E2] text-black px-4 py-1'}`}>{text}</span>
    );
}

export function Row({children}) {
    return (
        <div className='flex gap-6'>
            {children}        
        </div>
    );
}

export function Section({heading, children, button = null}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <article className='bg-white p-6 rounded-lg border border-[#CCC] flex flex-col gap-6'>
            <h3 className='flex justify-between items-center'>
                <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className='flex gap-2 items-center'>
                    <img src={chevronIcon} alt="" className={`${isCollapsed ? 'rotate-180' : ''}`} />
                    <span className='font-semibold text-xl'>{heading}</span>
                </button>
                {
                    button &&
                    <button type='button' onClick={button.onClick} className='px-4 py-2 text-sm text-text-pink'>{button.jsx}</button>
                }
            </h3>
            {!isCollapsed && children}
        </article>
    );
}

export function StatusChip({text, color}) {
    // Provide a default for undefined/null text
    const displayText = text || 'Unknown';
    
    // Use a default color if none provided
    const displayColor = color || '#888888';
    
    return (
        <span 
            style={{color: displayColor, backgroundColor: `${displayColor}33`}} 
            className='inline-block rounded-full text-center px-6 py-1 text-sm font-medium'
        >
            {displayText}
        </span>
    );
}

export function CloseButton({onClose}) {
    return (
        <button type="button" onClick={onClose} className='rounded-[4px] border border-[#CFCFCF]/50 py-1 px-3 flex gap-2 text-xs items-center'>
            <img src={minimizeIcon} alt="" />
            Close
        </button>
    );
}