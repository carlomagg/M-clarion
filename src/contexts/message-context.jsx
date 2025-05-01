import { createContext } from "react";

const MessageContext = createContext({
    message: null,
    dispatchMessage: () => {}
});

export default MessageContext; 