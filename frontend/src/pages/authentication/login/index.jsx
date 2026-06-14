import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import LoginForm from './LoginForm';
import { createGradient } from '../../../assets/theme/utilities';
import { unAuthorizedRequest } from '../../../utils/helpers/http';
import { loginUrl } from '../../../utils/helpers/apiUrls';
import { setTokens } from '../../../utils/helpers/auth';
import { useSnackbar } from '../../../components/CustomSnackBar';

const Login = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const loginMutation = useMutation({
    mutationFn: (credentials) =>
      unAuthorizedRequest({
        url: loginUrl,
        method: 'POST',
        payload: credentials,
      }),
    onSuccess: (data) => {
      if (data?.access && data?.refresh) {
        setTokens(data.access, data.refresh);
        showSnackbar('Login successful!', 'success');
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      showSnackbar(error.message || 'Login failed', 'error');
    },
  });

  const handleLogin = async (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: createGradient('#0f0f23', '#1a1a2e', 135),
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.15), transparent)',
          top: '-100px',
          right: '-50px',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(164, 0, 255, 0.1), transparent)',
          bottom: '-80px',
          left: '-50px',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(102, 126, 234, 0.2)',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <LoginForm
            onSubmit={handleLogin}
            isLoading={loginMutation.isPending}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
