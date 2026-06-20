import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { useQuery } from '@tanstack/react-query';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { getCurrentUserUrl } from '../../../utils/helpers/apiUrls.js';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const LogoIcon = styled(Box)(({ theme }) => ({
  width: '2rem',
  height: '2rem',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage:
    'linear-gradient(135deg, hsl(210, 98%, 60%) 0%, hsl(210, 100%, 35%) 100%)',
  color: 'hsla(210, 100%, 95%, 0.9)',
  border: '1px solid',
  borderColor: 'hsl(210, 100%, 55%)',
  boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
}));

export default function SideMenu() {
  const { data: userData } = useQuery({
    queryKey: [getCurrentUserUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: getCurrentUserUrl, signal }),
  });
  const currentUser = userData?.member || {};

  const getUserInitials = () => {
    if (!currentUser) return '?';
    const firstName = currentUser?.first_name || '';
    const lastName = currentUser?.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <LogoIcon>
          <DashboardRoundedIcon sx={{ fontSize: '1.1rem' }} />
        </LogoIcon>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: 'text.primary',
            }}
          >
            ONEUP
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'text.secondary',
              lineHeight: 1.2,
            }}
          >
            Task Manager
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Select Content */}
      <Box
        sx={{
          display: 'flex',
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box>

      <Divider />

      {/* Menu and Alerts */}
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
        <CardAlert />
      </Box>

      {/* Current User Section */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`}
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {getUserInitials()}
        </Avatar>
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            {currentUser?.first_name || 'User'} {currentUser?.last_name || ''}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {currentUser?.email || 'user@email.com'}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
