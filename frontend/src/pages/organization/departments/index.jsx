import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../../../layouts/LayoutContainers/DashboardLayout/index.jsx';
import DepartmentAddModal from './DepartmentAddModal.jsx';
import DepartmentEditModal from './DepartmentEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { useDeleteDepartment } from '../../../utils/hooks/useDepartments.js';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { departmentsUrl } from '../../../utils/helpers/apiUrls.js';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import DepartmentTable from './DepartmentTable.jsx';

const DepartmentsPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { data: departmentsResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: [departmentsUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const departments = departmentsResponse?.data?.results || [];
  const deleteMutation = useDeleteDepartment();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    onOpenModal('Edit Department');
  };

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
        onDelete={setDeleteConfirm}
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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Departments
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your organization's departments
            </Typography>
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
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default DepartmentsPage;
