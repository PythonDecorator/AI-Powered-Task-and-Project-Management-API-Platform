import { Drawer, Box } from "@mui/material";

const Sidenav = ({ color, brand, brandName }) => {
  return (
    <Drawer
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2 }}>
        {brand && <Box component="img" src={brand} alt={brandName} sx={{ height: 40 }} />}
      </Box>
    </Drawer>
  );
};

export default Sidenav;
