import React, { createContext, useContext, useState, useEffect } from 'react';

const MessageContext = createContext();

export const MessageTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  PROCESSING: 'processing',
};

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [messageQueue, setMessageQueue] = useState([]);

  // Process message queue
  useEffect(() => {
    if (messageQueue.length > 0 && !message) {
      // Find the highest priority message
      const processingMessage = messageQueue.find(m => m.type === 'processing');
      const errorMessage = messageQueue.find(m => m.type === 'error' || m.type === 'failed');
      const successMessage = messageQueue.find(m => m.type === 'success');
      
      // Set the highest priority message
      const nextMessage = processingMessage || errorMessage || successMessage || messageQueue[0];
      setMessage(nextMessage);
      
      // Remove the message from the queue
      setMessageQueue(prev => prev.filter(m => m !== nextMessage));
    }
  }, [messageQueue, message]);

  const dispatchMessage = (type, text, duration = 5000) => {
    if (type === null) {
      setMessage(null);
      return;
    }
    
    const newMessage = { type, text };
    
    // If a processing message is already showing, queue this message
    if (message && message.type === 'processing' && type !== 'processing') {
      setMessageQueue(prev => [...prev, newMessage]);
      return;
    }
    
    // If this is a generic loading message and a more specific one exists, ignore it
    if (type === 'loading' && text === 'Loading...' && 
        (message?.type === 'processing' || messageQueue.some(m => m.type === 'processing'))) {
      return;
    }
    
    // Handle the message based on its type
    if (type === 'processing') {
      // For processing messages, show immediately and clear any existing generic loading
      setMessage(newMessage);
    } else if (message) {
      // Queue the message if another is already showing
      setMessageQueue(prev => [...prev, newMessage]);
    } else {
      // Show the message and set a timer to clear it
      setMessage(newMessage);
      if (type !== 'processing') {
        setTimeout(() => {
          setMessage(current => current && current.text === text ? null : current);
        }, duration);
      }
    }
  };

  return (
    <MessageContext.Provider value={{ message, dispatchMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}; 