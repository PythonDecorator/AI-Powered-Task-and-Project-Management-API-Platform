# Frontend Rules

## Development Process
- **Always inspect existing codebase before making changes** — read actual patterns and structure, don't assume
- **Follow existing patterns and reuse components** — avoid duplicating functionality when solutions already exist
- **When fixing bugs:** Explain root cause first, then write code — ensures fix targets the actual problem
- **Always include tests for new features or fixes** where applicable

## Structure
- `main.jsx` mount only · `App.jsx` providers only · `src/store/` UI state via Context · server state in TanStack Query only
- Components: `src/components/` (Custom* primitives) · `src/examples/` (composites) · `src/pages/{feature}/` (pages + sub-components) · Max file length: 400 lines — split into subcomponents
- Routing: wrap every page in a layout from `src/layouts/` · always update `src/router.jsx`

## Component & Data Fetching Strategy (HitchPay Pattern)
- **No custom hooks** · Use React Query directly in components
  - Direct `useQuery()` calls with `authorizedRequest()` in component bodies
  - Form submissions use direct `authorizedRequest()` in `onSubmit` handlers
  - Better control over loading/error states
- **Components**: Use direct MUI components by default, reserve Custom* for specific needs
  - **Standard MUI** (`Box`, `Typography`, `Button`, `Grid`, `Card`, etc.) - primary choice for all layouts
  - `CustomModal` - for ALL modals
  - `GeneralForm` - for ALL forms with validation
  - `DeleteConfirmDialog` - for delete confirmations
  - `Loading`, `ErrorMessage` - for state feedback
  - Avoid unnecessary component wrapping
- **Form building**: Use `GeneralForm` component with inline schemas (Zod validation)
- **Modal pattern**: Use `CustomModal` + `GeneralForm` inside, managed via `ModalContext`
- **State management**: Page handles data (useQuery), Modal handles forms (GeneralForm), Page passes `refetch` callback

## HTTP & Authentication
- **All API calls via `http.js`**: Use `authorizedRequest()` or `unAuthorizedRequest()` based on endpoint
- **Direct useQuery for data fetching** (no custom hooks):
  ```jsx
  const { data, isPending, isError, error } = useQuery({
    queryKey: [apiUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: apiUrl, signal }),
    staleTime: 600000, // 10 minutes
  });
  
  if (isPending) return <Loading />;
  if (isError) return <ErrorMessage message={error?.message} />;
  return <Table data={data.data} />;
  ```
- **Form submissions** - direct `authorizedRequest()` in `onSubmit` handlers:
  ```jsx
  const handleSubmit = async (formData) => {
    const result = await authorizedRequest({
      url: apiUrl,
      method: 'POST',
      payload: formData,
    });
    onCloseModal(); // Modal closes on success
  };
  ```
- **URLs centralized in `apiUrls.js`**: Import URLs, never hardcode `/api/v1/...`
- **Auth helpers in `auth.js`**: setTokens(), clearAuth(), getAuthToken(), protectedAuthLoader()
- **Decision rule**:
  - ✅ authorizedRequest: GET, PATCH, DELETE, POST (private) — anything needing token
  - ✅ unAuthorizedRequest: POST (login), POST (register), POST (refresh-token) — public endpoints

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

## Forms & Tables
- **Forms**: GeneralForm component + inline schema with Zod validation + fieldProps for field-specific options
- **Form sections**: Group related fields via `sections` prop: `{ 'Personal Info': ['name', 'email'], 'Work': ['salary', 'role'] }`
- **Tables**: SimpleTable or DataGridTable components, receive `data` and `onEdit`/`onDelete` callbacks
- **Modal forms**: Modals use GeneralForm directly, handle submission, call `onSuccess?.()` to trigger parent `refetch()`
- **Dynamic options**: Use `onChangeListener` in schema to fetch dependent data (e.g., members dropdown updates when department changes)

## Data & API
- **API client**: `http.js` with axios + interceptors for token management
- **URL management**: All endpoints in `apiUrls.js` — import and use
- **TanStack Query**: All server state via useQuery — never useEffect for fetching, direct calls in components
- **No custom hooks**: Use `authorizedRequest()` and `unAuthorizedRequest()` directly
- **Signal handling**: Always pass `{ signal }` to queryFn for proper cancellation
- **Loading/Error feedback**: Use `<Loading />` and `<ErrorMessage />` components from `src/examples/`
