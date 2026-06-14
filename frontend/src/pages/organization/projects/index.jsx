import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../../../layouts/LayoutContainers/DashboardLayout/index.jsx';
import ProjectsAddModal from './ProjectsAddModal.jsx';
import ProjectsEditModal from './ProjectsEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { projectsUrl, deleteProjectUrl } from '../../../utils/helpers/apiUrls.js';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import ProjectsTable from './ProjectsTable.jsx';
import { useSnackbar } from '../../../components/CustomSnackBar';

const ProjectsPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projectsResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: [projectsUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: projectsUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const projects = projectsResponse?.results || [];

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteProjectUrl(id),
        method: 'DELETE',
      }),
  });

  const handleDeleteClick = (project) => {
    setDeleteConfirm(project);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      showSnackbar('Project deleted successfully', 'success');
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      showSnackbar('Failed to delete project', 'error');
    }
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    onOpenModal('Edit Project');
  };

  const handleAddClick = () => {
    setSelectedProject(null);
    onOpenModal('Add Project');
  };

  let content;

  if (isLoading) {
    content = <Loading message="Loading projects..." />;
  } else if (isError) {
    content = <ErrorMessage message={error?.message || 'Failed to load projects'} onRetry={refetch} />;
  } else if (projects && projects.length > 0) {
    content = (
      <ProjectsTable
        data={projects}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    );
  } else {
    content = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          No projects yet
        </Typography>
        <Button variant="contained" onClick={handleAddClick}>
          Create First Project
        </Button>
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 4, height: 28, borderRadius: 1, backgroundColor: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Projects
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Manage your organization's projects
              </Typography>
            </Box>
          </Box>
          {projects.length > 0 && (
            <Button variant="contained" onClick={handleAddClick}>
              + New Project
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        {content}
      </Box>

      <ProjectsAddModal onSuccess={refetch} />
      {selectedProject && <ProjectsEditModal project={selectedProject} onSuccess={refetch} />}

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title="Delete Project"
        itemName={deleteConfirm?.name || ''}
        warnings={deleteConfirm?.warnings || []}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteMutation.isPending}
        requireTypeConfirm={true}
        showReason={false}
      />
    </DashboardLayout>
  );
};

export default ProjectsPage;
