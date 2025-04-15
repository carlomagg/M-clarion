import auth from "../utils/auth"
import { get } from 'lockr'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../utils/consts'
import { useNavigate } from 'react-router-dom'

export default function authGuard() {
    const accessToken = get(ACCESS_TOKEN_NAME);
    const refreshToken = get(REFRESH_TOKEN_NAME);

    // Check if user is not logged in or tokens are missing
    if (!auth.isLoggedIn() || !accessToken || !refreshToken) {
        auth.logout();
        return false;
    }

    // Check if refresh token is expired
    const refreshTokenData = get(REFRESH_TOKEN_NAME);
    if (refreshTokenData && refreshTokenData.expiry) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > refreshTokenData.expiry) {
            auth.logout();
            return false;
        }
    }
    
    return true;
}