import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import styles from './ProcessIndicator.module.css';
import { useMessage } from '../../../contexts/MessageContext.jsx';

function ProcessIndicator() {
    const [show, setShow] = useState(false);
    const { messages, dispatchMessage } = useMessage();
    
    // Use the most recent message for display
    const latestMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    
    // Debug message context
    console.log('ProcessIndicator - messages:', messages);
    console.log('ProcessIndicator - latest message:', latestMessage);
    
    // Setup the effect for handling messages - this must be before any conditional return
    useEffect(() => {
        if (latestMessage) {
            console.log('ProcessIndicator - Message received:', latestMessage);
            setShow(true);
            // No need to manually remove messages - they auto-remove via setTimeout in MessageContext
        } else {
            setShow(false);
        }
    }, [messages]);
    
    // Early return if no message
    if (!latestMessage) return null;

    // Extract message properties
    const { type, text } = latestMessage;

    // Determine display type
    const displayType = 
        type === 'success' ? 'success' :
        type === 'failed' ? 'error' :
        type === 'error' ? 'error' :
        type === 'processing' ? 'loading' :
        'success';

    const checkmarkIcon = (
        <CheckCircle className="w-4 h-4 text-green-600" />
    );

    const exclamationIcon = (
        <XCircle className="w-4 h-4 text-red-600" />
    );

    const cancelIcon = (
        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
    );

    return (
        <div className={`${styles.container} ${show ? styles.show : styles.hide}`}>
            <div className={`${styles.content} flex items-center gap-3`} data-type={displayType}>
                <div className="flex-shrink-0">
                    {displayType === 'success' && checkmarkIcon}
                    {displayType === 'error' && exclamationIcon}
                    {(displayType === 'loading' || displayType === 'processing') && <Loader2 className="animate-spin w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0 text-sm font-medium">{text}</div>
                <button 
                    onClick={() => {
                        setShow(false);
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
