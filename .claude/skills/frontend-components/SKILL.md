---
name: frontend-components
description: Shared component library for OneUp AI — what exists, when to use each, MUI MCP usage protocol, component anatomy, and how to create new shared components. Check here before building anything new.
when_to_use: Use before creating any UI component. Use when asked about GeneralForm, CrudTable, CustomModal, ActionMenu, Loading, ErrorMessage, or any shared component. Use for MUI API questions — always check mui-mcp server, never answer from memory. Triggers on "component", "modal", "MUI", "button", "dialog", "chip".
paths: frontend/**
---

# Frontend Components

## Check before creating
**Always check `frontend/src/components/` first.** If a component exists, use it. If MUI handles it natively, use MUI directly. Only create a wrapper when you need to add consistent styling or business logic used in multiple places.

## Existing shared components

| Component | Location | Use for | Don't |
|-----------|----------|---------|-------|
| `GeneralForm` | `components/GeneralForm/` | All forms | Build custom form logic |
| `CrudTable` | `components/CrudTable/` | All data tables | Use DataGrid directly |
| `CustomModal` | `components/CustomModal.jsx` | All modals/dialogs | Use MUI Dialog directly |
| `DeleteConfirmDialog` | `components/DeleteConfirmDialog.jsx` | Delete confirmations | Build custom confirm dialogs |
| `ActionMenu` | `components/ActionMenu.jsx` | Table row action menus | Build custom action menus |
| `Loading` | `components/Loading.jsx` | Data loading states | Use CircularProgress directly |
| `ErrorMessage` | `components/ErrorMessage.jsx` | Error display | Show raw error text |
| `Loader` | `components/Loader.jsx` | Full-page loading overlay | Use Loading component |
| `CustomTypography` | `components/CustomTypography.jsx` | Text rendering | Prefer MUI Typography in simple cases |

### Key component APIs

**CustomModal**
```javascript
<CustomModal open={open} onClose={handleClose} title="Create Item" maxWidth="sm">
  <GeneralForm schema={schema} onSubmit={handleSubmit} />
</CustomModal>
```
Props: `open` (bool), `onClose` (func), `title` (string), `children`, `maxWidth` ('xs'|'sm'|'md'|'lg'|'xl')

**DeleteConfirmDialog**
```javascript
<DeleteConfirmDialog
  open={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  title="Delete Item?"
  message="This action cannot be undone."
  loading={mutation.isPending}
/>
```

**ActionMenu**
```javascript
<ActionMenu
  actions={[
    { label: 'Edit',   icon: <EditIcon />,   onClick: handleEdit },
    { label: 'Delete', icon: <DeleteIcon />, onClick: handleDelete },
  ]}
/>
```

**Loading / ErrorMessage**
```javascript
if (isPending) return <Loading message="Loading data..." />;
if (isError)   return <ErrorMessage message={error?.message} />;
```

## MUI questions — use the mui-mcp server

For any question about MUI component APIs, props, behavior, or version differences — don't answer from memory. Use the server:

1. Call the `useMuiDocs` tool to fetch the docs of the package relevant to the question
2. Call the `fetchDocs` tool to fetch any additional docs if needed, using ONLY the URLs present in the returned content
3. Repeat steps 1–2 until you have fetched all relevant docs for the given question
4. Use the fetched content to answer the question

This covers: component APIs, prop names, default values, `styleOverrides`, `slotProps`, `slots`, and migration from v5.

## Component anatomy

```javascript
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function CustomComponent({ label, onClick, disabled, sx, ...props }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        // 1. Base styles
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: 1,

        // 2. Token-based colors (never hardcoded)
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,

        // 3. Dark mode variant
        ...theme.applyStyles('dark', {
          backgroundColor: theme.palette.background.default,
        }),

        // 4. State styles
        '&:hover': { backgroundColor: theme.palette.action.hover, cursor: 'pointer' },

        // 5. Responsive
        px: { xs: 1, sm: 2 },

        // 6. Allow sx override
        ...sx,
      }}
      {...props}
    >
      {label}
    </Box>
  );
}

CustomComponent.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  sx: PropTypes.object,
};

CustomComponent.defaultProps = {
  onClick: () => {},
  disabled: false,
  sx: {},
};
```

## Creating a new shared component

1. Check `frontend/src/components/` — does it already exist?
2. Check MUI — can it be used directly without a wrapper? (Use `mui-mcp` if unsure about the API)
3. If a wrapper is needed: create in `frontend/src/components/YourComponent.jsx`
4. Follow the anatomy below — PropTypes, theme tokens, dark mode via `applyStyles`, `sx` override
5. Export from `frontend/src/components/index.jsx` if used in more than one place

**Don't wrap MUI for one-off use** — use it directly in the page component.

## Styling: when to use what

| Approach | When |
|----------|------|
| Local `sx` prop | Component-specific styles not reused elsewhere |
| Global `AppTheme` override | App-wide consistency for MUI components |
| Hybrid | Base in AppTheme, one-off tweak in `sx` |

For color tokens and dark mode patterns, see `frontend-theme`.

## Pre-shipping checklist
- [ ] Dark mode works (theme tokens only, no hardcoded colors — see `frontend-theme`)
- [ ] Responsive (check in DevTools at mobile viewport)
- [ ] PropTypes defined
- [ ] `sx` override supported (spread `...sx`)
- [ ] Exported from `index.jsx` if shared
