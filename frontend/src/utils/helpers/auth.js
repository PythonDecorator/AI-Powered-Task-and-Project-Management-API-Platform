import { redirect } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

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

export function getAuthToken() {
    const token = Cookies.get('access_token');
    if (!token) {
        return null;
    }

    try {
        const decodedToken = jwtDecode(token);
        const expTime = decodedToken.exp * 1000;
        const now = Date.now();
        if (expTime - now <= 0) {
            return 'EXPIRED';
        }
    } catch (error) {
        console.error("Error decoding token:", error);
        return 'EXPIRED';
    }

    return token;
}


export function checkAuthLoader() {
    const token = getAuthToken();
    if (token && token !== 'EXPIRED') {
        return redirect('/dashboard');
    }
    return null;
}

export function protectedAuthLoader() {
    const token = getAuthToken();

    if (!token || token === 'EXPIRED') {
        return redirect('/');
    }
    return null;
}
