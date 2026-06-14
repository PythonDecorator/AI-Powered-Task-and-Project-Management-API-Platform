import { Box } from "@mui/material";

const DashboardLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        px: { xs: 2, sm: 2, md: 3 },
        py: { xs: 2, sm: 2, md: 3 },
        minHeight: "100vh",
      }}
    >
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
