import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Reusable page layout for organization pages (Members, Departments, Projects)
 * Handles common header: title, subtitle, and action button
 */
export default function OrganizationPageLayout({
  title,
  subtitle,
  onActionClick,
  actionLabel = '+ New Item',
  showActionButton = true,
  children,
}) {
  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 4, height: 28, borderRadius: 1, backgroundColor: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {showActionButton && (
            <Button variant="contained" onClick={onActionClick}>
              {actionLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* Content Section */}
      <Box sx={{ mb: 4 }}>
        {children}
      </Box>
    </Box>
  );
}

OrganizationPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onActionClick: PropTypes.func,
  actionLabel: PropTypes.string,
  showActionButton: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
