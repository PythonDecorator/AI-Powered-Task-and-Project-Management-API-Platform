import { Drawer, Box, List, ListItem, ListItemIcon, ListItemText, Divider, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../../utils/hooks/useAuth.js";

const Sidenav = ({ color, brand, brandName }) => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Tasks', icon: '✓', path: '/tasks' },
    { label: 'Projects', icon: '📁', path: '/projects' },
    { label: 'Departments', icon: '🏢', path: '/dashboard/departments' },
  ];

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
          display: "flex",
          flexDirection: "column",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ fontSize: '1.8rem' }}>📱</Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          OneUp
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          sx={{
            color: 'error.main',
            borderColor: 'error.main',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderColor: 'error.main',
            },
          }}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidenav;
