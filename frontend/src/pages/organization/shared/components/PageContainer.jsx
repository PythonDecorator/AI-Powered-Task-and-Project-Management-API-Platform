import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

/**
 * Reusable page container with header, title, and actions
 *
 * @param {Object} props
 * @param {String} props.title - Page title
 * @param {String} props.subtitle - Optional subtitle/description
 * @param {React.ReactNode} props.actions - Action buttons/controls (right side)
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.sx - Additional sx styling
 */
export default function PageContainer({
  title,
  subtitle,
  actions,
  children,
  sx = {},
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, ...sx }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        {/* Title and Subtitle */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: subtitle ? 1 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {actions}
          </Stack>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

PageContainer.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};
