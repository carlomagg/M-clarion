import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import styles from './ProcessIndicator.module.css';
import { useContext } from 'react';
import MessageContext from '../../../contexts/message-context';

function ProcessIndicator() {
    const [show, setShow] = useState(false);
    const messageContext = useContext(MessageContext);
    
    if (!messageContext) {
        return null;
    }

    const { message, dispatchMessage } = messageContext;

    useEffect(() => {
        if (message) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(() => {
                    dispatchMessage(null);
                }, 300);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [message, dispatchMessage]);

    if (!message) return null;

    // Determine display type first
    const displayType = typeof message === 'string' ? 'success' :
                       Array.isArray(message) ? 'success' :
                       typeof message === 'object' && message !== null ? 
                           (message.type === 'success' ? 'success' :
                            message.type === 'failed' ? 'error' :
                            message.type === 'error' ? 'error' :
                            message.type === 'processing' ? 'loading' :
                            message.type || 'success') :
                       'success';

    // Handle message text based on message format and type
    const getDefaultMessage = (type) => {
        switch(type) {
            case 'success': return 'Operation completed successfully';
            case 'error': return 'An error occurred';
            case 'loading': return 'Processing...';
            default: return 'Operation completed';
        }
    };

    const messageText = typeof message === 'string' ? message :
                       Array.isArray(message) ? JSON.stringify(message) :
                       typeof message === 'object' && message !== null ?
                           (typeof message.text === 'string' ? message.text :
                            message.text ? JSON.stringify(message.text) :
                            getDefaultMessage(displayType)) :
                       getDefaultMessage(displayType);

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
                <div className="flex-1 min-w-0 text-sm font-medium">{messageText}</div>
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
