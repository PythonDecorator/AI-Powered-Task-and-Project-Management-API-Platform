import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, logout, getCurrentUser, setTokens, clearTokens } from '../apis';
import { useSnackbar } from '../../components/CustomSnackBar';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      const { access, refresh } = data.data;
      setTokens(access, refresh);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSnackbar('Login successful!', 'success');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      showSnackbar(message, 'error');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      showSnackbar('Logged out successfully', 'success');
    },
    onError: (error) => {
      clearTokens();
      queryClient.clear();
      const message = error.response?.data?.detail || 'Logout failed';
      showSnackbar(message, 'error');
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
