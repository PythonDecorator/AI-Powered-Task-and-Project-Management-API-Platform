import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../../../layouts/LayoutContainers/DashboardLayout/index.jsx';
import DepartmentAddModal from './DepartmentAddModal.jsx';
import DepartmentEditModal from './DepartmentEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { departmentsUrl, deleteDepartmentUrl } from '../../../utils/helpers/apiUrls.js';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import DepartmentTable from './DepartmentTable.jsx';
import { useSnackbar } from '../../../components/CustomSnackBar';

const DepartmentsPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { data: departmentsResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: [departmentsUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const departments = departmentsResponse?.results || [];

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteDepartmentUrl(id),
        method: 'DELETE',
      }),
  });

  const getDeleteWarnings = (department) => {
    const warnings = [];
    if (department.members && department.members.length > 0) {
      warnings.push(`Has ${department.members.length} team member(s)`);
    }
    return warnings;
  };

  const handleDeleteClick = (department) => {
    setDeleteConfirm({
      ...department,
      warnings: getDeleteWarnings(department),
    });
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      showSnackbar('Department deleted successfully', 'success');
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      showSnackbar('Failed to delete department', 'error');
    }
  };

  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    onOpenModal('Edit Department');
  }

  const handleAddClick = () => {
    setSelectedDepartment(null);
    onOpenModal('Add Department');
  };

  let content;

  if (isLoading) {
    content = <Loading message="Loading departments..." />;
  } else if (isError) {
    content = <ErrorMessage message={error?.message || 'Failed to load departments'} onRetry={refetch} />;
  } else if (departments && departments.length > 0) {
    content = (
      <DepartmentTable
        data={departments}
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
          No departments yet
        </Typography>
        <Button variant="contained" onClick={handleAddClick}>
          Create First Department
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
                Departments
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Manage your organization's departments
              </Typography>
            </Box>
          </Box>
          {departments.length > 0 && (
            <Button variant="contained" onClick={handleAddClick}>
              + New Department
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        {content}
      </Box>

      <DepartmentAddModal onSuccess={refetch} />
      {selectedDepartment && <DepartmentEditModal department={selectedDepartment} onSuccess={refetch} />}

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title="Delete Department"
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

export default DepartmentsPage;
