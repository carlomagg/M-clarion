import { useContext } from "react";
import { useMessage } from "../contexts/MessageContext";

export default function useDispatchMessage() {
    const { dispatchMessage } = useMessage();
    return dispatchMessage;
}