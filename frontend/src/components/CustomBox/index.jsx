import { Box } from '@mui/material';

const CustomBox = ({ children, sx, ...props }) => {
  return (
    <Box sx={sx} {...props}>
      {children}
    </Box>
  );
};

export default CustomBox;
