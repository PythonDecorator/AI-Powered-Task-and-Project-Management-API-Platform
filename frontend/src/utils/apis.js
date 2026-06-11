import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/user/login/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        Cookies.set('access_token', access, { expires: 1 });

        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = (email, password) =>
  apiClient.post('/user/login/', { email, password });

export const logout = () =>
  apiClient.post('/user/logout/', {
    refresh: Cookies.get('refresh_token'),
  });

export const getCurrentUser = async () =>
  apiClient.get('/user/me/');

export const setTokens = (accessToken, refreshToken) => {
  Cookies.set('access_token', accessToken, { expires: 1 });
  Cookies.set('refresh_token', refreshToken, { expires: 7 });
};

export const getTokens = () => ({
  access: Cookies.get('access_token'),
  refresh: Cookies.get('refresh_token'),
});

export const clearTokens = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};


export default apiClient;
