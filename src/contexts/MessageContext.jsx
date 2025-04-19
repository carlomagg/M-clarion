import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext();

export const MessageTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  const dispatchMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, duration);
  };

  return (
    <MessageContext.Provider value={{ message, dispatchMessage }}>
      {children}
      {message && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : message.type === 'error'
              ? 'bg-red-500 text-white'
              : message.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {message.text}
        </div>
      )}
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