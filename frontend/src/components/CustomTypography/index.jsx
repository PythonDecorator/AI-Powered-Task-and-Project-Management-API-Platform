import { Typography } from '@mui/material';
import { createGradient } from '../../assets/theme/utilities';

const CustomTypography = ({
  variant = 'body1',
  gradient = false,
  gradientStart = '#667eea',
  gradientEnd = '#764ba2',
  neon = false,
  neonColor = '#00d4ff',
  children,
  sx,
  ...props
}) => {
  const baseStyles = {
    ...(gradient && {
      background: createGradient(gradientStart, gradientEnd),
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }),
    ...(neon && {
      textShadow: `0 0 10px rgba(${
        neonColor === '#00d4ff'
          ? '0, 212, 255'
          : neonColor === '#ff006e'
          ? '255, 0, 110'
          : neonColor === '#00ff41'
          ? '0, 255, 65'
          : neonColor === '#a400ff'
          ? '164, 0, 255'
          : '102, 126, 234'
      }, 0.8)`,
    }),
  };

  return (
    <Typography variant={variant} sx={{ ...baseStyles, ...sx }} {...props}>
      {children}
    </Typography>
  );
};

export default CustomTypography;
