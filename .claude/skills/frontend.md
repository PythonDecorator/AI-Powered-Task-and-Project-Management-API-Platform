# Frontend Rules

## Structure
- `main.jsx` mount only · `App.jsx` providers only · `src/store/` UI state via Context · server state in TanStack Query only
- Components: `src/components/` (Custom* primitives) · `src/examples/` (composites) · `src/pages/{feature}/` (pages + sub-components) · Max file length: 400 lines — split into sub-components or hooks if exceeded
- Routing: wrap every page in a layout from `src/layouts/` · always update `src/router.jsx`

## Design System: Elegant, Gradient & Neon
- **Foundation**: MUI 5+ with Material Design 3 + custom theme for premium aesthetic
- **Gradients**: Use CSS `linear-gradient()` or `radial-gradient()` in `sx` prop for backgrounds, borders, text effects
- **Neon Effects**: Glow via `box-shadow: 0 0 20px rgba(color, 0.8)` · text glow: `text-shadow: 0 0 10px rgba(color, 0.9)` · always pair with semi-transparent neon colors
- **Color Palette**: Primary gradient from deep violet to electric cyan · accent neon: lime green, hot pink, electric blue · maintain WCAG AA contrast on all text
- **Animations**: Smooth 0.3s cubic-bezier transitions · subtle scale/opacity on hover · no jank — use `will-change` only when necessary
- **Scalability**: Component variants handle all states (loading, error, success) · breakpoints: mobile (xs), tablet (sm/md), desktop (lg+) · theme tokens scale proportionally

## Theming
- Never hardcode colors, spacing, or font sizes — always theme tokens
- Light: `src/assets/theme/` · Dark: `src/assets/theme-dark/` · both have `base/` + `components/`
- Spacing: `pxToRem(8/12/16/24)` · Radius tokens: xs·sm·md·lg·xl·xxl·xxxl · Colors: `theme.palette[x]?.main || x`
- Variants: contained=solid+shadow · outlined=transparent+border · text=transparent no border
- Hover: `transition: "all 0.2s ease"` · `translateY(-2px)` on interactive only · always define `:focus`
- Disabled: `opacity:0.6` + `cursor:not-allowed` + no hover
- Responsive mobile-first: `@media(max-width:600px)` + `@media(max-width:960px)`
- **Premium Touches**: Subtle backdrop-filter blur on modals · layered shadows for depth · gradient borders on premium cards

## MUI MCP Integration
- **Query Tool**: Use `@mui/mcp` for accurate component documentation, customization guides, and implementation examples
- **When to Use**: Complex customizations, custom component variants, theme extensions, accessibility requirements
- **Command**: `claude mcp add mui-mcp -- npx -y @mui/mcp@latest` (already configured)
- **Available Tools**: list_components, get_component_info, search_components, get_customization_guide, get_setup_guide, get_mui_guide

## Data & API
- All axios calls exported from `src/utils/apis.js` — never raw axios in components
- TanStack Query only — no `useEffect` for fetching · wrap in custom hooks in `hooks/`
- Invalidate query keys on every successful mutation

## Forms & Tables
- Every form has `schema.js` (zod/yup) + react-hook-form · modals via `CustomModal` + global context
- All tables via `@tanstack/react-table` mapped to custom theme components
- Form inputs: gradient borders on focus · smooth label animation · neon success/error states
