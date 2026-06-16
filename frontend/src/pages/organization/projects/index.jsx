import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useCrudTable } from '../../../components/CrudTable/useCrudTable';
import CrudTable from '../../../components/CrudTable';
import OrganizationPageLayout from '../OrganizationLayout.jsx';
import ProjectsAddModal from './ProjectsAddModal.jsx';
import ProjectsEditModal from './ProjectsEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { projectsUrl, deleteProjectUrl } from '../../../utils/helpers/apiUrls.js';
import { queryClient } from '../../../utils/helpers/http.js';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import { useSnackbar } from '../../../components/CustomSnackBar';
import Loading from '../../../components/Loading/index.jsx';

const ProjectsPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const table = useCrudTable({
    url: projectsUrl,
    defaultPageSize: 10,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteProjectUrl(id),
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', projectsUrl] });
      showSnackbar('Project deleted successfully', 'success');
      setDeleteConfirm(null);
    },
    onError: () => {
      showSnackbar('Failed to delete project', 'error');
    },
  });

  const handleDeleteClick = (project) => {
    setDeleteConfirm(project);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteConfirm.id);
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    onOpenModal('Edit Project');
  };

  const handleAddClick = () => {
    setSelectedProject(null);
    onOpenModal('Add Project');
  };

  // Define columns for CrudTable with ActionMenu
  const columns = [
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <CustomTypography sx={{ fontWeight: 500 }}>
          {params.row.name}
        </CustomTypography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <CustomTypography sx={{ color: 'text.secondary' }}>
          {params.row.description || 'No description'}
        </CustomTypography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const statusColors = {
          on_hold: 'warning',
          in_progress: 'info',
          completed: 'success',
          archived: 'default',
        };
        const statusColor = statusColors[params.row.status] || 'default';
        return (
          <Chip
            label={params.row.status?.replace('_', ' ') || 'N/A'}
            size="small"
            color={statusColor}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <ActionMenu
          menuItems={[
            {
              label: 'Edit',
              action: () => handleEditClick(params.row),
            },
            {
              label: 'Delete',
              color: 'error',
              action: () => handleDeleteClick(params.row),
            },
          ]}
        />
      ),
    },
  ];

  const emptyState = (
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

  return (
    <>
      <OrganizationPageLayout
        title="Projects"
        subtitle="Manage your organization's projects"
        onActionClick={handleAddClick}
        actionLabel="+ New Project"
        showActionButton={!table.isLoading && table.rows && table.rows.length > 0}
      >
        {table.isLoading ? (
          <Loading message="Loading projects..." />
        ) : table.rows && (table.rows.length > 0 || table.filterModel.items.length > 0) ? (
          <CrudTable
            table={table}
            columns={columns}
            tableName="Projects"
            getRowId={(row) => row.id}
          />
        ) : (
          emptyState
        )}
      </OrganizationPageLayout>

      <ProjectsAddModal onSuccess={table.refetch} />
      {selectedProject && <ProjectsEditModal project={selectedProject} onSuccess={table.refetch} />}

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
    </>
  );
};

export default ProjectsPage;
