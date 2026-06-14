import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  List,
  Avatar,
  useTheme,
  useMediaQuery,
  Tooltip,
  useScrollTrigger,
} from '@mui/material';
import {
  NotificationsActive,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '../../utils/helpers/http.js';
import { logoutUrl, getCurrentUserUrl } from '../../utils/helpers/apiUrls.js';
import { clearAuth } from '../../utils/helpers/auth.js';

const ElevationScroll = (props) => {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });
  return (
    <Box
      sx={{
        boxShadow: trigger ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      {children}
    </Box>
  );
};

const Navbar = ({ drawerWidth = 280, onDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);

  const { data: userData } = useQuery({
    queryKey: [getCurrentUserUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: getCurrentUserUrl, signal }),
  });

  const user = userData?.member || {};

  const logoutMutation = useMutation({
    mutationFn: () =>
      authorizedRequest({
        url: logoutUrl,
        method: 'POST',
      }),
    onSuccess: () => {
      clearAuth();
      navigate('/');
    },
    onError: () => {
      clearAuth();
      navigate('/');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Route → page title mapping
  const pageTitle = (() => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard';
    if (location.pathname.startsWith('/tasks')) return 'Tasks';
    if (location.pathname.startsWith('/organization/departments')) return 'Departments';
    if (location.pathname.startsWith('/organization/members')) return 'Members';
    if (location.pathname.startsWith('/organization/projects')) return 'Projects';
    if (location.pathname.startsWith('/organization')) return 'Organization';
    return 'OneUp';
  })();

  // Mock notifications (for now — can integrate API later)
  const notifications = [
    { id: 1, message: 'New member John Doe added', time: '5 min ago', read: false },
    { id: 2, message: 'Project Website Redesign updated', time: '1 hour ago', read: false },
    { id: 3, message: 'Department Engineering created', time: '2 hours ago', read: true },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const appBarContent = (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${!isMobile ? drawerWidth : 0}px)`,
        ml: !isMobile ? `${drawerWidth}px` : 0,
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.5,
          minHeight: { xs: '48px', sm: '48px', md: '48px' },
          py: 0,
        }}
      >
        {/* Left side: Menu icon (mobile only) + Page Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onDrawerToggle}
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* Right side: Notifications + Account */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
              size="small"
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsActive fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton
              onClick={(e) => setAccountAnchor(e.currentTarget)}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {user.first_name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            minWidth: '320px',
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
          {notifications.map((notif) => (
            <MenuItem key={notif.id} sx={{ py: 1, px: 2, fontSize: '0.9rem' }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{notif.message}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {notif.time}
                    </Typography>
                  </Box>
                  {!notif.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mt: 1 }} />
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </List>
      </Menu>

      {/* Account Menu */}
      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            minWidth: '260px',
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem dense>Profile Settings</MenuItem>
        <MenuItem dense onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );

  return <ElevationScroll>{appBarContent}</ElevationScroll>;
};

export default Navbar;
