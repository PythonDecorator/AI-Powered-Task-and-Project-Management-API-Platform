import { redirect } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

/**
 * Get the duration until token expiration (in milliseconds)
 */
export function getTokenDuration() {
    const token = Cookies.get('access_token');
    if (!token) return 0;

    try {
        const decodedToken = jwtDecode(token);
        const expTime = decodedToken.exp * 1000;
        const now = Date.now();
        return expTime - now;
    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
}

/**
 * Check if token is still valid (not expired)
 */
export function isTokenValid(token = null) {
    const accessToken = token || Cookies.get('access_token');
    if (!accessToken) return false;

    try {
        const decodedToken = jwtDecode(accessToken);
        const expTime = decodedToken.exp * 1000;
        return expTime > Date.now();
    } catch (error) {
        console.error("Error validating token:", error);
        return false;
    }
}

/**
 * Get the current access token
 */
export function getAuthToken() {
    const token = Cookies.get('access_token');
    return isTokenValid(token) ? token : null;
}

/**
 * Get the refresh token
 */
export function getRefreshToken() {
    return Cookies.get('refresh_token');
}

/**
 * Store tokens in cookies
 */
export function setTokens(accessToken, refreshToken) {
    Cookies.set('access_token', accessToken, {
        expires: 1,
        secure: true,
        sameSite: 'Strict'
    });
    if (refreshToken) {
        Cookies.set('refresh_token', refreshToken, {
            expires: 7,
            secure: true,
            sameSite: 'Strict'
        });
    }
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.clear();
}

/**
 * Check auth loader - redirect to dashboard if authenticated
 */
export function checkAuthLoader() {
    const token = getAuthToken();
    if (token) {
        return redirect('/dashboard');
    }
    return null;
}

/**
 * Protected auth loader - redirect to log in if not authenticated
 */
export function protectedAuthLoader() {
    const token = getAuthToken();

    if (!token) {
        return redirect('/');
    }
    return null;
}
