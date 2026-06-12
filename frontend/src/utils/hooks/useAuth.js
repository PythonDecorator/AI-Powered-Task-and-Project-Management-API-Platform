import { useMutation } from '@tanstack/react-query';
import { authorizedRequest, unAuthorizedRequest } from '../helpers/http.js';
import { loginUrl, logoutUrl } from '../helpers/apiUrls.js';
import { setTokens, clearAuth } from '../helpers/auth.js';

/**
 * Hook for user login
 * Uses unAuthorizedRequest (no token needed for login)
 * Stores tokens in cookies on success
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) =>
      unAuthorizedRequest({
        url: loginUrl,
        method: 'POST',
        payload: credentials,
      }),
    onSuccess: (data) => {
      // Store tokens in cookies
      if (data?.access && data?.refresh) {
        setTokens(data.access, data.refresh);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    },
  });
};

/**
 * Hook for user logout
 * Uses authorizedRequest (needs token to logout)
 * Clears all auth data
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: () =>
      authorizedRequest({
        url: logoutUrl,
        method: 'POST',
      }),
    onSuccess: () => {
      clearAuth();
    },
    onError: (error) => {
      console.error('Logout failed:', error.message);
      // Clear auth anyway
      clearAuth();
    },
  });
};

export default useLogin;
