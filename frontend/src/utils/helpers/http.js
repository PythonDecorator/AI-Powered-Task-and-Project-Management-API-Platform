import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

// Initialize Query Client
export const queryClient = new QueryClient();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const apiBaseUrl = API_BASE_URL;

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - add token to authorized requests
api.interceptors.request.use(
    (config) => {
        // Add token for all requests (API handles authorization)
        const token = Cookies.get("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Function to refresh the access token using refresh token
const refreshAccessToken = async () => {
    try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
            throw new Error("No refresh token found.");
        }

        // Use axios directly to avoid interceptor loop
        const response = await axios.post(
            `${apiBaseUrl}/user/login/refresh/`,
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = response.data?.access;
        if (newAccessToken) {
            Cookies.set("access_token", newAccessToken, { expires: 1 });
            return newAccessToken;
        } else {
            throw new Error("Failed to refresh token - no access token in response.");
        }
    } catch (error) {
        console.error("Token refresh failed:", error.message);
        handleLogout();
        return null;
    }
};

// Logout function - clear tokens and redirect
const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.clear();
    window.location.href = "/"; // Redirect to login
};

// Response interceptor - handle token expiry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and request hasn't been retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Try to refresh token
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            }
        }

        // Return error
        return Promise.reject(error);
    }
);

// Build query parameters
const buildParams = ({ searchTerm, page, ordering, status, role, is_active, ...other }) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (page !== undefined) params.append("page", page.toString());
    if (ordering) params.append("ordering", ordering);
    if (status) params.append("status", status);
    if (role) params.append("role", role);
    if (is_active !== undefined) params.append("is_active", is_active.toString());
    // Add any other params
    Object.entries(other).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, value.toString());
        }
    });
    return params;
};

// Main request function
const makeRequest = async ({
    url,
    signal,
    payload,
    method = "GET",
    searchTerm,
    page,
    ordering,
    status,
    is_active,
    role,
    ...otherParams
}) => {
    try {
        const params = buildParams({
            searchTerm,
            page,
            ordering,
            status,
            role,
            is_active,
            ...otherParams,
        });

        const config = {
            url,
            method,
            signal,
        };

        // Add data for non-GET requests
        if (payload) {
            config.data = payload;
        }

        // Add params for GET requests or as query string
        if (params.toString()) {
            config.params = params;
        }

        const response = await api(config);
        return response.data;
    } catch (error) {
        console.error(`API Request Failed [${method} ${url}]:`, error.message);
        throw error;
    }
};

// Export request functions
export const authorizedRequest = async (options) =>
    makeRequest(options);

export const unAuthorizedRequest = async (options) =>
    makeRequest(options); // Same as authorized - API handles permissions
