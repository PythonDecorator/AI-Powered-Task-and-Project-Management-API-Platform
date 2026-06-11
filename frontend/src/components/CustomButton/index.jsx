import { Button, CircularProgress } from '@mui/material';
import { createGradient, createNeonGlow } from '../../assets/theme/utilities';

const CustomButton = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  isLoading = false,
  neon = false,
  neonColor = '#00d4ff',
  gradient = false,
  gradientStart = '#667eea',
  gradientEnd = '#764ba2',
  disabled = false,
  children,
  sx,
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'none',
      fontWeight: 600,
      position: 'relative',
      overflow: 'hidden',
    };

    if (variant === 'contained') {
      return {
        ...baseStyles,
        background: gradient ? createGradient(gradientStart, gradientEnd) : undefined,
        boxShadow: neon ? createNeonGlow(neonColor, 0.4) : undefined,
        '&:hover:not(:disabled)': {
          transform: 'translateY(-2px)',
          boxShadow: neon ? createNeonGlow(neonColor, 0.6) : undefined,
        },
        '&:active:not(:disabled)': {
          transform: 'translateY(0)',
        },
        '&:disabled': {
          opacity: 0.6,
        },
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyles,
        background: 'transparent',
        border: `2px solid ${gradientStart}`,
        color: gradientStart,
        '&:hover:not(:disabled)': {
          background: `rgba(102, 126, 234, 0.1)`,
          transform: 'translateY(-2px)',
          boxShadow: neon ? createNeonGlow(neonColor, 0.3) : undefined,
        },
        '&:disabled': {
          opacity: 0.6,
          borderColor: 'rgba(102, 126, 234, 0.4)',
        },
      };
    }

    if (variant === 'text') {
      return {
        ...baseStyles,
        color: gradientStart,
        '&:hover:not(:disabled)': {
          background: `rgba(102, 126, 234, 0.08)`,
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          opacity: 0.6,
        },
      };
    }

    return baseStyles;
  };

  return (
    <Button
      variant={variant === 'contained' && gradient ? 'contained' : variant}
      size={size}
      disabled={disabled || isLoading}
      sx={{
        ...getButtonStyles(),
        ...(size === 'small' && { py: 0.75, px: 1.5 }),
        ...(size === 'medium' && { py: 1, px: 2 }),
        ...(size === 'large' && { py: 1.5, px: 3 }),
        ...sx,
      }}
      {...props}
    >
      {isLoading ? (
        <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
