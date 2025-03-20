import { Loader2 } from 'lucide-react';
import styles from './ProcessIndicator.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import MessageContext from '../../../contexts/message-context';

const checkmarkIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16}>
    <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 13l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

const exclamationIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16}>
    <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2"/>
    <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
</svg>

const cancelIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16}>
    <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>

function ProcessIndicator() {
    const [show, setShow] = useState(true);
    const messageContext = useContext(MessageContext);
    
    if (!messageContext) {
        return null;
    }

    const {message, dispatchMessage} = messageContext;
    const hideTimeout = useRef(null);
    const removeTimeout = useRef(null);

    useEffect(() => {
        if (message) {
            setShow(true);
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            if (removeTimeout.current) clearTimeout(removeTimeout.current);

            hideTimeout.current = setTimeout(() => {
                setShow(false);
                removeTimeout.current = setTimeout(() => {
                    dispatchMessage(null);
                }, 300);
            }, 3000);
        }

        return () => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            if (removeTimeout.current) clearTimeout(removeTimeout.current);
        };
    }, [message, dispatchMessage]);

    if (!message) return null;

    // Ensure message text is always a string
    const messageText = typeof message.text === 'object' 
        ? JSON.stringify(message.text)
        : String(message.text || '');

    // Determine the display type - treat 'failed' as 'error' and 'processing' as 'loading'
    const displayType = message.type === 'failed' ? 'error' : 
                       message.type === 'processing' ? 'loading' : 
                       message.type;

    return (
        <div className={`${styles.container} ${show ? styles.show : styles.hide}`}>
            <div className={styles.content} data-type={displayType}>
                <div className="flex-shrink-0">
                    {displayType === 'success' && checkmarkIcon}
                    {displayType === 'error' && exclamationIcon}
                    {(displayType === 'loading' || displayType === 'processing') && <Loader2 className="animate-spin" size={16} />}
                </div>
                <span>{messageText}</span>
                <button 
                    onClick={() => {
                        setShow(false);
                        setTimeout(() => dispatchMessage(null), 300);
                    }}
                    aria-label="Close notification"
                    className="flex-shrink-0"
                >
                    {cancelIcon}
                </button>
            </div>
        </div>
    );
}

export default ProcessIndicator;
