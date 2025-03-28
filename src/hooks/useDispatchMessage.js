import { useContext } from "react";
import MessageContext from "../contexts/message-context";

export default function useDispatchMessage() {
    const {dispatchMessage} = useContext(MessageContext)
    return dispatchMessage;
}