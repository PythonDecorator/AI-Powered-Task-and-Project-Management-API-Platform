import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginForm from './LoginForm';
import { createGradient } from '../../../assets/theme/utilities';
import { useLogin } from '../../../utils/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleLogin = async (data) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          navigate('/dashboard');
        },
      }
    );
  };

  useEffect(() => {
    if (loginMutation.isSuccess) {
      navigate('/dashboard');
    }
  }, [loginMutation.isSuccess, navigate]);

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
          <LoginForm onSubmit={handleLogin} isLoading={loginMutation.isPending} />
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
