import { Grid, Avatar } from "@mui/material";
import { useCurrentUser } from "./useCurrentUser.js";
import DashboardLayout from "../../layouts/LayoutContainers/DashboardLayout/index.jsx";
import CustomBox from "../../components/CustomBox/index.jsx";
import CustomTypography from "../../components/CustomTypography/index.jsx";
import CustomCard from "../../components/CustomCard/index.jsx";
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
      <CustomBox sx={{ mb: 4 }}>
        <CustomTypography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {currentUser?.first_name || 'User'}! 👋
        </CustomTypography>
        <CustomTypography variant="body1" sx={{ color: 'text.secondary' }}>
          Here's what's happening with your tasks today
        </CustomTypography>
      </CustomBox>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <CustomCard sx={{ height: '100%' }}>
            <CustomBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CustomBox>
                <CustomTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total Tasks
                </CustomTypography>
                <CustomTypography variant="h5" sx={{ mt: 0.5 }}>
                  0
                </CustomTypography>
              </CustomBox>
              <CustomBox sx={{ fontSize: '2rem' }}>📋</CustomBox>
            </CustomBox>
          </CustomCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CustomCard sx={{ height: '100%' }}>
            <CustomBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CustomBox>
                <CustomTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  Completed
                </CustomTypography>
                <CustomTypography variant="h5" sx={{ mt: 0.5 }}>
                  0
                </CustomTypography>
              </CustomBox>
              <CustomBox sx={{ fontSize: '2rem' }}>✅</CustomBox>
            </CustomBox>
          </CustomCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CustomCard sx={{ height: '100%' }}>
            <CustomBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CustomBox>
                <CustomTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  In Progress
                </CustomTypography>
                <CustomTypography variant="h5" sx={{ mt: 0.5 }}>
                  0
                </CustomTypography>
              </CustomBox>
              <CustomBox sx={{ fontSize: '2rem' }}>⏳</CustomBox>
            </CustomBox>
          </CustomCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CustomCard sx={{ height: '100%' }}>
            <CustomBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CustomBox>
                <CustomTypography variant="caption" sx={{ color: 'text.secondary' }}>
                  Overdue
                </CustomTypography>
                <CustomTypography variant="h5" sx={{ mt: 0.5 }}>
                  0
                </CustomTypography>
              </CustomBox>
              <CustomBox sx={{ fontSize: '2rem' }}>⚠️</CustomBox>
            </CustomBox>
          </CustomCard>
        </Grid>
      </Grid>

      <CustomCard>
        <CustomTypography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          User Info
        </CustomTypography>
        <CustomBox sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {currentUser?.first_name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <CustomBox>
            <CustomTypography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {currentUser?.first_name || 'User'}
            </CustomTypography>
            <CustomTypography variant="body2" sx={{ color: 'text.secondary' }}>
              ID: {currentUser?.id || 'N/A'}
            </CustomTypography>
          </CustomBox>
        </CustomBox>
      </CustomCard>
    </DashboardLayout>
  );
};

export default Dashboard;
