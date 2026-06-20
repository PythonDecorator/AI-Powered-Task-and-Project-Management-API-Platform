---
name: frontend-theme
description: MUI v6 theme reference for OneUp AI — color palettes, semantic tokens, typography, shadows, component overrides, and dark mode patterns. Read before styling any component.
when_to_use: Use when styling any component, choosing colors, implementing dark mode, working with MUI theme tokens, adding shadows, customising typography, or overriding MUI component defaults. Triggers on "color", "theme", "dark mode", "styling", "sx prop", "palette", "typography".
paths: frontend/**
---

# Frontend Theme

## Quick reference

| Setting | Value |
|---------|-------|
| CSS variable prefix | `--template-*` |
| Color scheme attribute | `data-mui-color-scheme` (on `<html>`) |
| Base border radius | 8px |
| Font family | Inter, sans-serif |
| Body base size | 14px (0.875rem) |
| Ripple effect | **Globally disabled** — use background-color transitions |
| Theme entry point | `frontend/src/pages/shared-theme/AppTheme.jsx` |

## Never hardcode colors
```javascript
// ❌ Wrong
sx={{ color: '#666', backgroundColor: '#fff' }}

// ✅ Right — auto-switches between light/dark
sx={{ color: 'text.secondary', backgroundColor: 'background.paper' }}
```

## Semantic tokens

Use these in `sx`, not raw palette shades:

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `primary.main` | brand[400] | brand[400] | Primary actions, highlights |
| `primary.light` | brand[200] | brand[300] | Hover on primary |
| `primary.dark` | brand[700] | brand[700] | Active/pressed |
| `primary.contrastText` | brand[50] | brand[50] | Text on primary bg |
| `error.main` | red[400] | red[500] | Destructive actions, error badges |
| `warning.main` | orange[400] | orange[500] | Warning alerts |
| `success.main` | green[400] | green[500] | Success, confirmations |
| `info.main` | brand[300] | brand[700] | Informational badges |
| `divider` | α(gray[300], 0.4) | α(gray[700], 0.6) | Borders, separators |
| `background.default` | hsl(0,0%,99%) | gray[900] | Page background |
| `background.paper` | hsl(220,35%,97%) | hsl(220,30%,7%) | Cards, dialogs |
| `text.primary` | gray[800] | white | Body text |
| `text.secondary` | gray[600] | gray[400] | Labels, hints, secondary text |
| `action.hover` | α(gray[200], 0.2) | α(gray[600], 0.2) | Hover overlays |
| `action.selected` | α(gray[200], 0.3) | α(gray[600], 0.3) | Selected state |

## Color palettes (raw)

Use palette shades only when semantic tokens genuinely don't fit.

**Brand (blue):** `hsl(210, 100%, 95%)` → `hsl(210, 100%, 21%)` (50–900)
**Gray:** `hsl(220, 35%, 97%)` → `hsl(220, 35%, 3%)` (50–900)
**Green:** `hsl(120, 80%, 98%)` → `hsl(120, 87%, 6%)` (50–900)
**Orange:** `hsl(45, 100%, 97%)` → `hsl(45, 93%, 12%)` (50–900)
**Red:** `hsl(0, 100%, 97%)` → `hsl(0, 93%, 6%)` (50–900)

## Typography scale

| Variant | Size | Weight |
|---------|------|--------|
| h1 | 3rem / 48px | 600 |
| h2 | 2.25rem / 36px | 600 |
| h3 | 1.875rem / 30px | normal |
| h4 | 1.5rem / 24px | 600 |
| h5 | 1.25rem / 20px | 600 |
| h6 | 1.125rem / 18px | 600 |
| body1/body2 | 0.875rem / 14px | 400 |
| caption | 0.75rem / 12px | 400 |

## Shadow system

```javascript
// Use shadows[1] for component base shadows
// shadows[0] = none
// shadows[1] = var(--template-palette-baseShadow)  ← dynamic light/dark
// shadows[2–24] = MUI defaults
```

## How to use theme in components

```javascript
import { useTheme } from '@mui/material/styles';

// Option A: sx shorthand (most common)
<Box sx={{ color: 'text.secondary', borderRadius: 1 }} />

// Option B: theme object (needed for applyStyles)
const theme = useTheme();
<Box sx={{
  backgroundColor: theme.palette.background.paper,
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.background.default,
  }),
}} />

// Option C: CSS variables (in plain CSS or when theme object unavailable)
<Box sx={{ color: 'var(--template-palette-text-primary)' }} />
```

## Dark mode

```javascript
// In sx prop
sx={{
  backgroundColor: 'background.paper',                       // light default
  ...theme.applyStyles('dark', {
    backgroundColor: 'background.default',
  }),
}}

// Detect/toggle mode
import { useColorScheme } from '@mui/material/styles';
const { mode, setMode } = useColorScheme();
// mode: 'light' | 'dark' | 'system'
setMode('dark');
```

## Chip color semantics

```javascript
<Chip label="Active"    color="success" />   // green
<Chip label="Failed"    color="error"   />   // red
<Chip label="Pending"   color="warning" />   // orange
<Chip label="System"    color="default" />   // gray
<Chip label="Info note" color="info"    />   // blue
```

## Component override reference (what the theme already changes)

**Buttons** — `contained primary`: gradient gray bg on light, inverted on dark. No ripple. Heights: `small` = 2.25rem, `medium` = 2.5rem.

**Inputs** — 8px 12px padding, 8px border-radius, focus ring `3px solid α(brand[500], 0.5)`, placeholder opacity 0.7.

**Select** — custom icon (`UnfoldMoreRounded`), `::before`/`::after` hidden.

**Checkbox** — 16×16px, custom icons (`CheckRounded`, `RemoveRounded`), brand[500] when checked.

**Chip** — pill-shaped (`border-radius: 999px`), label weight 600.

**Card** — `padding: 16px`, `border: 1px solid divider`, `box-shadow: none`. Light: `gray[50]` bg. Dark: `gray[800]` bg.

**Menu / MenuItem** — `border-radius: 8px`, `border: 1px solid divider`, no `backgroundImage`.

**Link** — animated underline via `::before`, no ripple, focus ring.

**Dialog** — `border-radius: 10px`, `border: 1px solid divider`.

**Tab** — `text-transform: none`, `font-weight: 500`, transparent border default → themed on hover/selected.

Don't re-style these components from scratch — extend them.

## AppTheme API

```javascript
import AppTheme from '@/pages/shared-theme/AppTheme';

// Standard (wraps entire app in App.jsx)
<AppTheme>
  <CssBaseline enableColorScheme />
  {/* app content */}
</AppTheme>

// With page-level overrides
<AppTheme themeComponents={{ MuiButton: { styleOverrides: { root: { fontSize: '16px' } } } }}>
  {/* page content */}
</AppTheme>
```

Props: `children`, `disableCustomTheme` (bool), `themeComponents` (MUI components overrides object).

## File structure

```
frontend/src/pages/shared-theme/
  AppTheme.jsx
  themePrimitives.jsx           raw palettes, colorSchemes, typography, shadows
  utilities.js                  createGradient(), createNeonGlow()
  ColorModeIconDropdown.jsx
  customizations/
    inputs.jsx                  Button, Checkbox, Select, Input
    dataDisplay.jsx             List, Chip, TablePagination
    feedback.jsx                Alert, Dialog, LinearProgress
    navigation.jsx              Menu, Link, Drawer, Tabs, Stepper
    surfaces.jsx                Card, Paper, Accordion
```
