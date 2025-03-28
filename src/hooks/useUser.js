import { useContext } from "react";
import AuthContext from "../contexts/auth-context";

export default function useUser() {
    const auth = useContext(AuthContext);
    return auth.getUser();
}