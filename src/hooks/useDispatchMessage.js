import { useContext } from "react";
import { useMessage } from "../contexts/MessageContext.jsx";

export default function useDispatchMessage() {
    try {
        // Try to get the dispatchMessage function from the context
        const { dispatchMessage } = useMessage();
        return dispatchMessage;
    } catch (error) {
        // If the context is not available, provide a fallback function
        console.warn("MessageContext not found. Using fallback message dispatcher.");
        return (type, text) => {
            console.log(`[${type}] ${text}`);
        };
    }
}