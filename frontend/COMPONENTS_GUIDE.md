# Custom Components Guide

All components are fully customizable, based on MUI, and styled with elegant gradients and neon effects.

## Import

```jsx
import {
  CustomButton,
  CustomInput,
  CustomFormInput,
  LoginInput,
  OTPInput,
  CustomTypography,
  CustomModal,
  CustomDialog,
  CustomTabs,
  TabPanel,
} from '@/components';
```

---

## Form Components

### CustomInput
Basic text input wrapper with label and error handling.

```jsx
<CustomInput
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={hasError}
  errorMessage="Invalid email"
  required
  disabled={false}
  fullWidth
/>
```

**Props:**
- `label` - Input label
- `type` - Input type (text, email, password, etc.)
- `placeholder` - Placeholder text
- `value` - Current value
- `onChange` - Change handler
- `onBlur` - Blur handler
- `error` - Boolean for error state
- `errorMessage` - Error message to display
- `disabled` - Disabled state
- `required` - Show required indicator
- `fullWidth` - Full width input
- `size` - 'small', 'medium' (default)
- `multiline` - Enable multiline
- `rows` - Number of rows for multiline
- `startAdornment` - Icon/element at start
- `endAdornment` - Icon/element at end

---

### CustomFormInput
Enhanced form input with validation support and icons.

```jsx
import EmailIcon from '@mui/icons-material/Email';

<CustomFormInput
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  startIcon={<EmailIcon />}
  error={validation.hasError}
  helperText={validation.error}
  disabled={isLoading}
  required
/>
```

**Props:**
- All `CustomInput` props plus:
- `startIcon` - Icon at start (InputAdornment)
- `endIcon` - Icon at end (InputAdornment)
- `hideLabel` - Hide the label
- `validation` - Object with `{ hasError, error }`

---

### LoginInput
Specialized input for login forms with enhanced styling.

```jsx
import LockIcon from '@mui/icons-material/Lock';

<LoginInput
  label="Password"
  type="password"
  placeholder="••••••••"
  icon={<LockIcon />}
  error={hasError}
  helperText="Invalid password"
/>
```

**Props:**
- `label` - Input label
- `type` - Input type
- `placeholder` - Placeholder text
- `error` - Error state
- `helperText` - Error message
- `disabled` - Disabled state
- `icon` - InputAdornment icon at start

---

### OTPInput
Specialized component for OTP entry (6 digits by default).

```jsx
const [otp, setOtp] = useState('');

<OTPInput
  length={6}
  value={otp}
  onChange={setOtp}
  onComplete={(completedOtp) => {
    // Handle completed OTP
  }}
  label="Enter OTP"
  error={otpError}
  errorMessage="Invalid OTP"
/>
```

**Props:**
- `length` - Number of OTP digits (default: 6)
- `value` - Current OTP value
- `onChange` - Change handler (called for each digit)
- `onComplete` - Called when all digits filled
- `disabled` - Disabled state
- `error` - Error state
- `errorMessage` - Error message
- `label` - Label text
- `sx` - Additional styles

---

## Display Components

### CustomTypography
Text component with gradient and neon effects.

```jsx
// Regular text
<CustomTypography variant="h1">
  Heading
</CustomTypography>

// Gradient text
<CustomTypography
  variant="h2"
  gradient
  gradientStart="#667eea"
  gradientEnd="#764ba2"
>
  Gradient Heading
</CustomTypography>

// Neon text
<CustomTypography
  variant="body1"
  neon
  neonColor="#00d4ff"
>
  Neon Text
</CustomTypography>
```

**Props:**
- `variant` - MUI Typography variant (h1-h6, body1-2, caption, etc.)
- `gradient` - Enable gradient effect
- `gradientStart` - Start color (hex)
- `gradientEnd` - End color (hex)
- `neon` - Enable neon glow
- `neonColor` - Neon color (#00d4ff, #ff006e, #00ff41, #a400ff, #667eea)
- All MUI Typography props

---

### CustomButton
Elegant button with gradient, neon, and loading states.

```jsx
// Contained with gradient
<CustomButton variant="contained" gradient>
  Sign In
</CustomButton>

// Outlined
<CustomButton variant="outlined">
  Cancel
</CustomButton>

// Text only
<CustomButton variant="text">
  Learn More
</CustomButton>

// Loading state
<CustomButton isLoading>
  Signing In...
</CustomButton>

// Neon effect
<CustomButton
  variant="contained"
  neon
  neonColor="#00d4ff"
>
  Neon Button
</CustomButton>
```

**Props:**
- `variant` - 'contained' (default), 'outlined', 'text'
- `size` - 'small', 'medium' (default), 'large'
- `color` - Color name (primary, secondary, etc.)
- `gradient` - Enable gradient background
- `gradientStart` - Gradient start color
- `gradientEnd` - Gradient end color
- `neon` - Enable neon glow
- `neonColor` - Neon color
- `isLoading` - Show loading spinner
- `disabled` - Disabled state
- All MUI Button props

---

## Dialog & Modal Components

### CustomModal
Elegant modal dialog with backdrop blur and glassmorphism.

```jsx
const [open, setOpen] = useState(false);

<CustomModal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  neon
  neonColor="#00d4ff"
>
  <Typography>
    Are you sure you want to proceed?
  </Typography>
</CustomModal>
```

**Props:**
- `open` - Open state
- `onClose` - Close handler
- `title` - Modal title
- `children` - Modal content
- `actions` - DialogActions content
- `size` - 'xs', 'sm' (default), 'md', 'lg', 'xl'
- `neon` - Enable neon glow
- `neonColor` - Neon color
- `sx` - Additional styles

---

### CustomDialog
Confirmation/alert dialog with predefined actions and types.

```jsx
const [openDelete, setOpenDelete] = useState(false);

<CustomDialog
  open={openDelete}
  onClose={() => setOpenDelete(false)}
  onConfirm={() => {
    // Handle delete
  }}
  type="error"
  title="Delete Item"
  message="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  loading={isDeleting}
/>
```

**Props:**
- `open` - Open state
- `onClose` - Close handler
- `onConfirm` - Confirm handler
- `title` - Dialog title
- `message` - Main message
- `description` - Additional description
- `confirmText` - Confirm button text (default: "Confirm")
- `cancelText` - Cancel button text (default: "Cancel")
- `type` - 'default', 'success', 'warning', 'error'
- `loading` - Loading state
- `neon` - Enable neon glow
- `neonColor` - Neon color

---

## Navigation Components

### CustomTabs
Tab component with gradient indicators.

```jsx
import { CustomTabs, TabPanel } from '@/components';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';

const [tabValue, setTabValue] = useState(0);

<CustomTabs
  value={tabValue}
  onChange={(e, val) => setTabValue(val)}
  gradient
  gradientStart="#667eea"
  gradientEnd="#764ba2"
  tabs={[
    { label: 'Settings', icon: <SettingsIcon /> },
    { label: 'History', icon: <HistoryIcon /> },
  ]}
/>

<TabPanel value={tabValue} index={0}>
  Settings content...
</TabPanel>

<TabPanel value={tabValue} index={1}>
  History content...
</TabPanel>
```

**Props:**
- `tabs` - Array of `{ label, icon, iconPosition, disabled }`
- `value` - Current tab index
- `onChange` - Tab change handler
- `variant` - 'standard' (default), 'scrollable', 'fullWidth'
- `orientation` - 'horizontal' (default), 'vertical'
- `gradient` - Enable gradient indicator
- `gradientStart` - Gradient start color
- `gradientEnd` - Gradient end color
- `fullWidth` - Full width tabs

---

## Usage Examples

### Login Form
```jsx
import { LoginInput, CustomButton } from '@/components';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // API call
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: '420px', mx: 'auto' }}>
      <LoginInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <LoginInput
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <CustomButton
        variant="contained"
        gradient
        fullWidth
        onClick={handleLogin}
        isLoading={loading}
      >
        Sign In
      </CustomButton>
    </Box>
  );
}
```

### OTP Verification
```jsx
function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <CustomTypography variant="h4" gradient sx={{ mb: 3 }}>
        Verify Your Identity
      </CustomTypography>
      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
        onComplete={async (completedOtp) => {
          // Verify OTP
          setVerified(true);
        }}
      />
    </Box>
  );
}
```

### Settings Dialog
```jsx
const [openSettings, setOpenSettings] = useState(false);

<CustomDialog
  open={openSettings}
  onClose={() => setOpenSettings(false)}
  onConfirm={() => setOpenSettings(false)}
  type="default"
  title="Update Settings"
  message="Save all changes?"
  confirmText="Save"
/>
```

---

## Design System

All components follow the theme system with:
- **Primary Gradient**: #667eea → #764ba2
- **Secondary Gradient**: #00d4ff → #667eea
- **Neon Colors**: cyan, magenta, lime, purple, pink, blue
- **Dark Backgrounds**: #0f0f23 (light mode), #050510 (dark mode)
- **Smooth Animations**: 0.3s cubic-bezier transitions
- **WCAG AA Contrast**: All text meets accessibility standards

---

## Customization

### Add custom styles
```jsx
<CustomButton sx={{ borderRadius: '20px', py: 2 }}>
  Custom Button
</CustomButton>
```

### Create variants
```jsx
const GradientButton = (props) => (
  <CustomButton gradient gradientStart="#667eea" gradientEnd="#764ba2" {...props} />
);
```

### Responsive design
```jsx
<CustomInput
  sx={{
    maxWidth: { xs: '100%', sm: '400px', md: '500px' }
  }}
/>
```

---

## Next: Group 2 Components

Ready to build Group 2 (Data Display, Feedback & Navigation)?
- CustomTable
- CustomProgress
- CustomBadge
- CustomAvatar
- CustomSnackBar
- CustomAlert
- CustomDropdownMenu
- CustomMenu
