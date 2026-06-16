import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { DialogsProvider, NotificationsProvider } from './shared';

/**
 * Organization Layout
 * Wraps all organization pages with required providers (Dialogs, Notifications)
 * Also provides a consistent base layout for organization pages
 */
export default function OrganizationLayout() {
  return (
    <DialogsProvider>
      <NotificationsProvider>
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
          <Outlet />
        </Box>
      </NotificationsProvider>
    </DialogsProvider>
  );
}
