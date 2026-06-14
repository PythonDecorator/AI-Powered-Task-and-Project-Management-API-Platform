import { useState, useEffect } from "react";
import { Drawer, Box, List, ListItem, ListItemIcon, ListItemText, Divider, Button, Typography, Collapse, useTheme, useMediaQuery, Avatar, Chip } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ExpandLess, ExpandMore, Dashboard, CheckCircle, Business, People, FolderOpen, Logout, Bolt } from "@mui/icons-material";
import { authorizedRequest } from "../../utils/helpers/http.js";
import { logoutUrl, getCurrentUserUrl } from "../../utils/helpers/apiUrls.js";
import { clearAuth } from "../../utils/helpers/auth.js";

const Sidenav = ({ color, brand, brandName, onClose, open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedMenu, setExpandedMenu] = useState(null);

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

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose?.();
  };

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { label: 'Dashboard', icon: Dashboard, path: '/dashboard' },
    { label: 'Tasks', icon: CheckCircle, path: '/tasks' },
    {
      label: 'Organization',
      icon: Business,
      submenu: [
        { label: 'Departments', path: '/organization/departments' },
        { label: 'Members', path: '/organization/members' },
        { label: 'Projects', path: '/organization/projects' },
      ],
    },
  ];

  const drawerWidth = 280;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(102, 126, 234, 0.03) 100%)`,
        },
      }}
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      onClose={onClose}
      open={isMobile ? open : true}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: `linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '8px',
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          <Bolt sx={{ fontSize: '1.5rem' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            OneUp
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            AI Task Management
          </Typography>
        </Box>
      </Box>

      {/* User Profile Section */}
      {user && (
        <Box
          sx={{
            p: 2,
            mx: 1,
            mt: 2,
            borderRadius: '12px',
            background: `linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%)`,
            border: `1px solid rgba(102, 126, 234, 0.2)`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                fontWeight: 'bold',
              }}
            >
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Member'}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              textTransform: 'capitalize',
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          />
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 3, px: 1.5, gap: 0.5 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.submenu
            ? item.submenu.some(sub => isActive(sub.path))
            : isActive(item.path);

          return (
            <Box key={item.label}>
              {item.submenu ? (
                <>
                  <ListItem
                    button
                    onClick={() => toggleMenu(item.label)}
                    sx={{
                      my: 1.2,
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: expandedMenu === item.label
                        ? 'rgba(102, 126, 234, 0.15)'
                        : isItemActive
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'transparent',
                      borderLeft: isItemActive ? '4px solid' : '4px solid transparent',
                      borderLeftColor: 'primary.main',
                      pl: 2,
                      boxShadow: expandedMenu === item.label || isItemActive
                        ? '0 4px 12px rgba(102, 126, 234, 0.15)'
                        : 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.15)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isItemActive ? 'primary.main' : 'text.secondary',
                        transition: 'color 0.3s',
                      }}
                    >
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: isItemActive ? 600 : 500,
                          color: isItemActive ? 'primary.main' : 'text.primary',
                          transition: 'all 0.3s',
                        },
                      }}
                    />
                    {expandedMenu === item.label ? (
                      <ExpandLess sx={{ color: 'primary.main' }} />
                    ) : (
                      <ExpandMore sx={{ color: 'text.secondary' }} />
                    )}
                  </ListItem>
                  <Collapse in={expandedMenu === item.label} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 1 }}>
                      {item.submenu.map((subitem) => {
                        const subIsActive = isActive(subitem.path);
                        return (
                          <ListItem
                            button
                            key={subitem.path}
                            onClick={() => handleNavigate(subitem.path)}
                            sx={{
                              ml: 2,
                              my: 0.8,
                              borderRadius: '8px',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              backgroundColor: subIsActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                              borderLeft: subIsActive ? '3px solid' : '3px solid transparent',
                              borderLeftColor: 'primary.main',
                              pl: 2,
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.15)',
                                transform: 'translateX(2px)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: subIsActive ? 'primary.main' : 'text.secondary',
                                mr: 2,
                                transition: 'all 0.3s',
                              }}
                            />
                            <ListItemText
                              primary={subitem.label}
                              sx={{
                                '& .MuiTypography-root': {
                                  fontSize: '0.9rem',
                                  fontWeight: subIsActive ? 600 : 500,
                                  color: subIsActive ? 'primary.main' : 'text.primary',
                                  transition: 'all 0.3s',
                                },
                              }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem
                  button
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    my: 1.3,
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: isItemActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    borderLeft: isItemActive ? '4px solid' : '4px solid transparent',
                    borderLeftColor: 'primary.main',
                    pl: 2,
                    boxShadow: isItemActive ? '0 4px 12px rgba(102, 126, 234, 0.15)' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.15)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isItemActive ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.3s',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isItemActive ? 600 : 500,
                        color: isItemActive ? 'primary.main' : 'text.primary',
                        transition: 'all 0.3s',
                      },
                    }}
                  />
                </ListItem>
              )}
            </Box>
          );
        })}
      </List>

      {/* Logout Section */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          startIcon={<Logout />}
          sx={{
            backgroundColor: 'error.main',
            color: 'white',
            fontWeight: 600,
            borderRadius: '10px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': {
              backgroundColor: 'error.dark',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              opacity: 0.7,
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
