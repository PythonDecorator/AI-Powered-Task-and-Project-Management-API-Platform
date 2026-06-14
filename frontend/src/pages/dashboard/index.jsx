import { Box, Card, CardContent, Typography, Grid, Avatar, Button } from "@mui/material";
import { Business, People, FolderOpen } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser.js";
import DashboardLayout from "../../layouts/LayoutContainers/DashboardLayout/index.jsx";
import Loading from "../../components/Loading/index.jsx";
import { authorizedRequest } from "../../utils/helpers/http.js";
import { departmentsUrl, membersUrl, projectsUrl } from "../../utils/helpers/apiUrls.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: currentUserResponse, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserResponse?.data || currentUserResponse;

  const { data: departmentsResponse } = useQuery({
    queryKey: [departmentsUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const { data: membersResponse } = useQuery({
    queryKey: [membersUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: membersUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const { data: projectsResponse } = useQuery({
    queryKey: [projectsUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: projectsUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const departmentCount = departmentsResponse?.results?.length || 0;
  const memberCount = membersResponse?.results?.length || 0;
  const projectCount = projectsResponse?.results?.length || 0;

  if (userLoading) {
    return (
      <DashboardLayout>
        <Loading message="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {currentUser?.first_name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Here's your organization at a glance
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/organization/departments')}
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        >
          View Departments
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/organization/members')}
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        >
          Manage Members
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/organization/projects')}
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        >
          View Projects
        </Button>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Organization Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Departments
                  </Typography>
                  <Typography variant="h5">{departmentCount}</Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                }}>
                  <Business sx={{ fontSize: '1.75rem', color: 'primary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Members
                  </Typography>
                  <Typography variant="h5">{memberCount}</Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                }}>
                  <People sx={{ fontSize: '1.75rem', color: 'success.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h5">{projectCount}</Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                }}>
                  <FolderOpen sx={{ fontSize: '1.75rem', color: 'info.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Dashboard;
