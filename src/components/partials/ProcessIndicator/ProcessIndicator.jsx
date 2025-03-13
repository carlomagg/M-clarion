import { Loader, Loader2 } from 'lucide-react';
import styles from './ProcessIndicator.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import MessageContext from '../../../contexts/message-context';

const checkmarkIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={14} height={14}>
<circle cx="12" cy="12" r="11" fill="none" stroke="green" strokeWidth="2"/>
<path d="M7 13l3 3 7-7" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

const exclamationIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={14} height={14}>
<circle cx="12" cy="12" r="11" fill="none" stroke="red" strokeWidth="2"/>
<line x1="12" y1="7" x2="12" y2="13" stroke="red" strokeWidth="2" strokeLinecap="round"/>
<circle cx="12" cy="17" r="1" fill="red"/>
</svg>

const cancelIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
<line x1="8" y1="8" x2="16" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
<line x1="16" y1="8" x2="8" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
</svg>

function ProcessIndicator() {

    const [show, setShow] = useState(true);
    const {message, dispatchMessage} = useContext(MessageContext)

    const hideTimeout = useRef(null);
    const removeTimeout = useRef(null);

    useEffect(() => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current)
        if (message.type === 'success' || message.type === 'failed') {
            hideTimeout.current = setTimeout(() => {
                setShow(false)
            }, message.type === 'success' ? 3000 : 6000)
        }

        return () => {
            clearTimeout(hideTimeout.current)
        }
    }, [message]);

    useEffect(() => {
        if (show === false) {
            if (removeTimeout.current) clearTimeout(removeTimeout.current)
            removeTimeout.current = setTimeout(() => {
                dispatchMessage(null)
            }, 600)
    
            return () => {
                clearTimeout(removeTimeout.current)
            }
        }
    }, [show]);

    let colorsString, text, icon;

    if (message.type === 'success') {
        colorsString = 'bg-[#E6FFE6] text-[#008000] border-[#008000]';
        text = message.text || 'Successful';
        icon = checkmarkIcon;
    } else if (message.type === 'failed') {
        colorsString = 'bg-[#FFE6E6] text-[#FF0000] border-[#FF0000]';
        text = message.text || 'Failed';
        icon = exclamationIcon;
    } else if (message.type === 'processing') {
        colorsString = 'bg-[#F0F0F0] text-[#333333] border-[#333333]';
        text = message.text || 'Processing';
        icon = <Loader2 width={16} height={16} color={'#333333'} className='animate-spin' />
    }

    const indicator = (
        <div className={`min-w-96 pl-4 pr-2 min-h-8 py-2 flex gap-2 items-center justify-center border rounded-lg ${colorsString} ${show ? styles['show'] : styles['hide']}`}>
            <div className='flex gap-2 ml-auto'>
                <span>
                    {icon}
                </span>
                <span className='leading-4 text-sm'>
                    {text}
                </span>
            </div>
            <button type='buton' className='ml-auto' onClick={() => setShow(false)}>
                {cancelIcon}
            </button>
        </div>
    )

    return (
        <div className='fixed bottom-0 left-0 w-full h-0 flex justify-center z-[999]'>
            {indicator}
        </div>
    )
}

export default ProcessIndicator;
