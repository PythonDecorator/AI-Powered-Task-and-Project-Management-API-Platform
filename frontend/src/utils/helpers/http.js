import {QueryClient} from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

// Initialize Query Client
export const queryClient = new QueryClient();

// Define API base URL
const apiBaseUrl = "";

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for authorized requests only
api.interceptors.request.use(
    async (config) => {
        if (config.isAuthorized) {
            const token = Cookies.get("oneupaiToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Function to refresh the access token
const refreshAccessToken = async () => {
    try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
            throw new Error("No refresh token found.");
        }

        const response = await axios.post(`${apiBaseUrl}/refresh-token`, {refreshToken});

        if (response.data?.status) {
            const newAccessToken = response.data.accessToken;

            // Store the new token in cookies
            Cookies.set("oneupaiToken", newAccessToken, {
                expires: 1, // 1 day
                secure: true,
                sameSite: "Strict",
            });

            return newAccessToken;
        } else {
            throw new Error("Failed to refresh token.");
        }
    } catch (error) {
        console.error("Token refresh failed:", error.message);
        handleLogout();
        return null;
    }
};

// Logout function (if refresh fails)
const handleLogout = () => {
    Cookies.remove("oneupaiToken");
    Cookies.remove("refreshToken");
    localStorage.removeItem("adminDetails");
    window.location.href = "/"; // Redirect user to login
};

// Response interceptor for handling token expiry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is due to token expiry (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark request as retried
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                // Update token and retry the request
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            }
        }

        // Return other errors as-is
        const errorMessage =
            error.response?.data?.message || "An error occurred while processing the request";
        return Promise.reject(new Error(errorMessage));
    }
);

// Function to build query parameters
const buildParams = ({searchTerm, page, ordering, status, role, is_active}) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (page !== undefined) params.append("page", page.toString());
    if (ordering) params.append("ordering", ordering);
    if (status) params.append("status", status);
    if (role) params.append("role", role);
    if (is_active !== undefined) params.append("is_active", is_active.toString());
    return params;
};

// Function to make requests with token handling
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
                               isAuthorized = false, // By default, no token is included
                           }) => {
    try {
        const params = buildParams({searchTerm, page, ordering, status, role, is_active});
        const config = {
            url,
            method,
            params,
            data: payload,
            signal,
            isAuthorized, // Only authorized requests will attach a token
        };

        const response = await api(config);

        if (!response.data?.status) {
            throw new Error(response.data.message || "Request failed.");
        }

        return response.data; // Return API response data
    } catch (error) {
        console.error("API Request Failed:", error.message);
        throw error;
    }
};

// Functions for different types of requests
export const authorizedRequest = async (options) =>
    makeRequest({...options, isAuthorized: true});

export const unAuthorizedRequest = async (options) =>
    makeRequest({...options, isAuthorized: false}); // No token included
