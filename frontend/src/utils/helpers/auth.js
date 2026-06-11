import { redirect } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

export function getTokenDuration() {
    const token = Cookies.get('oneupai');
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
    const token = Cookies.get('oneupaiToken');
    if (!token) {
        return null;
    }

    // const remainingTime = getTokenDuration();
    // if (remainingTime <= 0) {
    //     return 'EXPIRED';
    // }

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
