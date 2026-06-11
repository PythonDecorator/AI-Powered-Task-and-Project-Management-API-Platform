import { Box } from "@mui/material";

const DashboardLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        ml: { xs: 0, lg: 30 },
        p: { xs: 2, sm: 3, md: 4 },
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
