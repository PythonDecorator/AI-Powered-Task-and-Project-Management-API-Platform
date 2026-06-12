import { Card, CardContent } from '@mui/material';

const CustomCard = ({ children, sx, ...props }) => {
  return (
    <Card
      sx={{
        backgroundColor: 'transparent',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          borderColor: 'rgba(102, 126, 234, 0.3)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default CustomCard;
