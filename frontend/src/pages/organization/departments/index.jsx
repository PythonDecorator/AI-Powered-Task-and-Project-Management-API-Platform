import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import DashboardLayout from '../../../layouts/LayoutContainers/DashboardLayout/index.jsx';
import DepartmentAddModal from './DepartmentAddModal.jsx';
import DepartmentEditModal from './DepartmentEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { useDeleteDepartment } from '../../../utils/hooks/useDepartments.js';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { departmentsUrl } from '../../../utils/helpers/apiUrls.js';
import CustomBox from '../../../components/CustomBox/index.jsx';
import CustomButton from '../../../components/CustomButton/index.jsx';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';
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
      <CustomBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CustomTypography variant="h6" sx={{ color: 'text.secondary' }}>
          No departments yet
        </CustomTypography>
        <CustomButton variant="contained" onClick={handleAddClick}>
          Create First Department
        </CustomButton>
      </CustomBox>
    );
  }

  return (
    <DashboardLayout>
      <CustomBox sx={{ mb: 4 }}>
        <CustomBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <CustomTypography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Departments
            </CustomTypography>
            <CustomTypography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your organization's departments
            </CustomTypography>
          </div>
          {departments.length > 0 && (
            <CustomButton variant="contained" onClick={handleAddClick}>
              + New Department
            </CustomButton>
          )}
        </CustomBox>
      </CustomBox>

      <CustomBox sx={{ mb: 4 }}>
        {content}
      </CustomBox>

      <DepartmentAddModal onSuccess={refetch} />
      {selectedDepartment && <DepartmentEditModal department={selectedDepartment} onSuccess={refetch} />}

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default DepartmentsPage;
