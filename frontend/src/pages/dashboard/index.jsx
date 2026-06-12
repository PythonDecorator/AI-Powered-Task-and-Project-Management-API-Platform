import { Box, Card, CardContent, Typography, Grid, Avatar } from "@mui/material";
import { useCurrentUser } from "./useCurrentUser.js";
import DashboardLayout from "../../layouts/LayoutContainers/DashboardLayout/index.jsx";
import Loading from "../../components/Loading/index.jsx";

const Dashboard = () => {
  const { data: currentUserResponse, isLoading } = useCurrentUser();
  const currentUser = currentUserResponse?.data || currentUserResponse;

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading message="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {currentUser?.first_name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Here's what's happening with your tasks today
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tasks
                  </Typography>
                  <Typography variant="h5">0</Typography>
                </Box>
                <Box sx={{ fontSize: '2rem' }}>📋</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h5">0</Typography>
                </Box>
                <Box sx={{ fontSize: '2rem' }}>✅</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h5">0</Typography>
                </Box>
                <Box sx={{ fontSize: '2rem' }}>⏳</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Overdue
                  </Typography>
                  <Typography variant="h5">0</Typography>
                </Box>
                <Box sx={{ fontSize: '2rem' }}>⚠️</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ backgroundColor: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            User Info
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {currentUser?.first_name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {currentUser?.first_name || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ID: {currentUser?.id || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
