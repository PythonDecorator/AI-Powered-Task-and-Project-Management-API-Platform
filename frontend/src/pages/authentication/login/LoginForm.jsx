import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Box, Button, TextField, Typography, Link, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { loginSchema } from './schema';
import { createGradient, createNeonGlow } from '../../../assets/theme/utilities';

const LoginForm = ({ onSubmit, isLoading = false, onDemoClick }) => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '420px',
        mx: 'auto',
        px: 2,
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: createGradient('#667eea', '#764ba2'),
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Sign in to your account
        </Typography>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <form.Field
            name="email"
            validators={{
              onChange: loginSchema.shape.email,
            }}
            children={(field) => (
              <>
                <Typography
                  component="label"
                  variant="subtitle2"
                  sx={{
                    display: 'block',
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  error={field.state.meta.errors.length > 0}
                  helperText={field.state.meta.errors[0]?.toString()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.15)`,
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.6,
                      },
                    },
                  }}
                />
              </>
            )}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography
              component="label"
              variant="subtitle2"
              sx={{
                fontWeight: 500,
              }}
            >
              Password
            </Typography>
            <Link
              href="/forgot-password"
              sx={{
                fontSize: '0.875rem',
                color: '#667eea',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot?
            </Link>
          </Box>
          <form.Field
            name="password"
            validators={{
              onChange: loginSchema.shape.password,
            }}
            children={(field) => (
              <>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  error={field.state.meta.errors.length > 0}
                  helperText={field.state.meta.errors[0]?.toString()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.15)`,
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.6,
                      },
                    },
                  }}
                />
              </>
            )}
          />
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{
            py: 1.5,
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: createGradient('#764ba2', '#667eea', 45),
              transition: 'left 0.3s ease',
              zIndex: -1,
            },
            '&:hover:not(:disabled)::before': {
              left: 0,
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: 'inherit' }} />
          ) : (
            'Sign In'
          )}
        </Button>

        <Button
          type="button"
          fullWidth
          variant="outlined"
          onClick={onDemoClick}
          sx={{
            py: 1.5,
            mb: 2,
            borderColor: 'rgba(102, 126, 234, 0.5)',
            color: '#667eea',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              borderColor: '#667eea',
            },
          }}
        >
          Demo Mode 🎯
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              sx={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;
