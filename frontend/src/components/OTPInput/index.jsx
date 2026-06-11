import { Box, TextField, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';

const OTPInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  errorMessage,
  label = 'Enter OTP',
  sx,
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef(Array(length).fill(null));

  useEffect(() => {
    if (value) {
      const digits = value.split('').slice(0, length);
      setOtp([...digits, ...Array(length - digits.length).fill('')]);
    }
  }, [value, length]);

  const handleChange = (index, event) => {
    const { value: newValue } = event.target;

    if (!/^\d*$/.test(newValue)) return;

    const newOtp = [...otp];
    newOtp[index] = newValue.slice(-1);
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange?.(otpString);

    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pastedData = event.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    event.preventDefault();
    const digits = pastedData.split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < length) newOtp[i] = digit;
    });

    setOtp(newOtp);
    const otpString = newOtp.join('');
    onChange?.(otpString);

    if (newOtp.every(digit => digit !== '')) {
      onComplete?.(otpString);
    }
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            fontWeight: 500,
            color: error ? '#f44336' : 'text.primary',
          }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: 'center',
          ...sx,
        }}
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <TextField
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            error={error}
            variant="outlined"
            size="small"
            sx={{
              width: '50px',
              '& .MuiOutlinedInput-root': {
                height: '50px',
                padding: 0,
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.15)`,
                },
                '&.Mui-error': {
                  backgroundColor: 'rgba(244, 67, 54, 0.05)',
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px rgba(244, 67, 54, 0.15)`,
                  },
                },
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 600,
                color: 'text.primary',
                padding: '0 !important',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: error ? '#f44336' : 'rgba(102, 126, 234, 0.2)',
              },
            }}
            inputProps={{
              maxLength: 1,
              style: { textAlign: 'center' },
            }}
          />
        ))}
      </Box>

      {error && errorMessage && (
        <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block', textAlign: 'center' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default OTPInput;
