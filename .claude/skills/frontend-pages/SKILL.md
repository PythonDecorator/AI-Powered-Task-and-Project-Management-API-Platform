---
name: frontend-pages
description: Page layout patterns for OneUp AI dashboard — NewBaseLayout, page folder structure, routing setup, MUI X theme customizations, and responsive design. Read before creating any new page.
when_to_use: Use when creating a new page or route, setting up page layout, adding navigation items, configuring MUI X (charts, data grid, date pickers), or implementing responsive design. Triggers on "new page", "layout", "routing", "navigation", "sidebar", "dashboard".
paths: frontend/**
---

# Frontend Page Structure

Reuse `NewBaseLayout` for all dashboard pages — don't create new layout wrappers. This skill covers the structural scaffolding; for how a page should *read* (spacing rhythm, surface use, hierarchy, designed states), see `frontend-design`.

## New page folder structure

```
frontend/src/pages/yourPageName/
  YourPage.jsx               main page component (thin — just assembles sub-components)
  components/
    Header.jsx               title, breadcrumb, or filters
    MainContent.jsx          grid layout with data
    [other components]
  theme/
    customizations/          only if using MUI X (charts, datagrid, date pickers, tree view)
      charts.js
      dataGrid.js
      datePickers.js
      treeView.js
      index.js
```

Only create `theme/customizations/` if the page uses MUI X components. Most pages don't need it.

## NewBaseLayout (reuse this — don't copy it)

**Location:** `frontend/src/pages/dashboardNew/NewBaseLayout.jsx`

Provides: AppTheme + CssBaseline + SideMenu (desktop) + AppNavbar (mobile) + NotificationsProvider + DialogsProvider + `<Outlet />` for nested routes.

## Routing

```javascript
// src/router.jsx
import NewBaseLayout from '@/pages/dashboardNew/NewBaseLayout';
import YourNewPage from '@/pages/yourPageName/YourPage';
import { protectedAuthLoader } from '@/utils/helpers/auth';

{
  element: <NewBaseLayout />,
  loader: protectedAuthLoader,      // protects all child routes
  children: [
    { path: 'dashboard',  element: <Dashboard /> },
    { path: 'your-page',  element: <YourNewPage /> },
  ],
}
```

## Page component pattern

```javascript
// YourPage.jsx — thin, just assembles
import Header from './components/Header';
import MainContent from './components/MainContent';

export default function YourPage() {
  return (
    <>
      <Header />
      <MainContent />
    </>
  );
}
```

```javascript
// components/Header.jsx
export default function Header() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>Page Title</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Description</Typography>
    </Box>
  );
}
```

```javascript
// components/MainContent.jsx
import { Grid } from '@mui/material';

export default function MainContent() {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>  {/* MUI v6 Grid v2 syntax */}
        <StatCard />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <DataSection />
      </Grid>
    </Grid>
  );
}
```

**Grid v2 note:** Use `size={{ xs: 12, md: 6 }}` — not the old `item xs={12} md={6}` syntax.

## Responsive patterns

```javascript
// Responsive margins (already in NewBaseLayout — don't add them again)
sx={{ mx: { xs: 2, sm: 3, md: 5 }, my: { xs: 2, sm: 3, md: 4 } }}

// Show/hide by breakpoint
sx={{ display: { xs: 'none', md: 'flex' } }}

// Breakpoints: xs=0 · sm=600 · md=960 · lg=1280 · xl=1920
```

## Dark mode in pages

Use theme tokens everywhere — they switch automatically. For the full token reference and `applyStyles` patterns, see `frontend-theme`. Never hardcode colors.

## MUI X theme customizations (only if needed)

If the page uses MUI X components, create per-package overrides:

```javascript
// theme/customizations/charts.js
import { gray } from '../../../shared-theme/themePrimitives';

export const chartsCustomizations = {
  MuiChartsAxis: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiChartsAxis-line': { stroke: gray[300] },
        ...theme.applyStyles('dark', { '& .MuiChartsAxis-line': { stroke: gray[700] } }),
      }),
    },
  },
};
```

```javascript
// theme/customizations/index.js
export { chartsCustomizations } from './charts';
export { dataGridCustomizations } from './dataGrid';
// etc.
```

Then pass to AppTheme if not using NewBaseLayout (rare):
```javascript
import { chartsCustomizations, dataGridCustomizations } from './theme/customizations';
<AppTheme themeComponents={{ ...chartsCustomizations, ...dataGridCustomizations }}>
```

NewBaseLayout already merges the standard MUI X customizations from `dashboardNew/theme/` — you only need page-level ones for overrides specific to your page.

## Navigation — adding a new page to the sidebar

Edit `MenuContent.jsx` in `dashboardNew/components/`:
```javascript
{
  segment: 'your-page',
  title: 'Your Page',
  icon: <YourIcon />,
}
```
