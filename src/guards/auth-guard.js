import auth from "../utils/auth"

export default function authGuard() {
    if (!auth.isLoggedIn()) auth.logout();
}