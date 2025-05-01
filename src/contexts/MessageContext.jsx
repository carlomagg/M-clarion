import React, { createContext, useContext, useState } from 'react';

// Create the context
const MessageContext = createContext();

// Create the provider component
export function MessageProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const dispatchMessage = (type, text) => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, type, text }]);
    
    // Auto-remove messages after 5 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
    }, 5000);
  };

  return (
    <MessageContext.Provider value={{ messages, dispatchMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

// Create a hook for components to use the context
export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
} 