import { Tabs, Tab, Box } from '@mui/material';
import { createGradient } from '../../assets/theme/utilities';

const CustomTabs = ({
  tabs,
  value,
  onChange,
  variant = 'standard',
  orientation = 'horizontal',
  gradient = false,
  gradientStart = '#667eea',
  gradientEnd = '#764ba2',
  fullWidth = false,
  sx,
  ...props
}) => {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant={variant}
      orientation={orientation}
      fullWidth={fullWidth}
      sx={{
        borderBottom: orientation === 'horizontal' ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
        borderRight: orientation === 'vertical' ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
        '& .MuiTabs-indicator': {
          background: gradient ? createGradient(gradientStart, gradientEnd) : '#667eea',
          height: orientation === 'horizontal' ? '3px' : '3px',
          borderRadius: '2px',
        },
        ...sx,
      }}
      {...props}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={index}
          label={tab.label}
          icon={tab.icon}
          iconPosition={tab.iconPosition || 'start'}
          disabled={tab.disabled}
          sx={{
            minHeight: '48px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            color: 'text.secondary',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
            },
            '&.Mui-selected': {
              color: gradient ? gradientStart : '#667eea',
              fontWeight: 600,
            },
            '&.Mui-disabled': {
              color: 'text.disabled',
              opacity: 0.5,
            },
          }}
        />
      ))}
    </Tabs>
  );
};

const TabPanel = ({ children, value, index, sx }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    sx={{
      animation: value === index ? 'fadeIn 0.3s ease-in' : 'none',
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      ...sx,
    }}
  >
    {value === index && children}
  </Box>
);

export { CustomTabs as default, TabPanel };
