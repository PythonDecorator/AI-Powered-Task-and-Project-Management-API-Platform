import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Outlet } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import { DialogsProvider, NotificationsProvider } from '../organization/shared';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function NewBaseLayout(props) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <Box sx={{ display: 'flex' }}>
            <SideMenu />
            <AppNavbar />
            {/* Main content */}
            <Box
              component="main"
              sx={(theme) => ({
                flexGrow: 1,
                backgroundColor: theme.vars
                  ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                  : alpha(theme.palette.background.default, 1),
                overflow: 'auto',
              })}
            >
              <Stack
                spacing={2}
                sx={{
                  alignItems: 'stretch',
                  mx: { xs: 2, sm: 3, md: 5 },
                  my: { xs: 2, sm: 3, md: 4 },
                  pb: 5,
                }}
              >
                <Outlet />
              </Stack>
            </Box>
          </Box>
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
