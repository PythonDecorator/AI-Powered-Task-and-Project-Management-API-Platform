import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Avatar, AvatarGroup, Chip, Typography, Button } from '@mui/material';
import { useCrudTable } from '../../../components/CrudTable/useCrudTable';
import CrudTable from '../../../components/CrudTable';
import OrganizationPageLayout from '../OrganizationLayout.jsx';
import DepartmentAddModal from './DepartmentAddModal.jsx';
import DepartmentEditModal from './DepartmentEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { departmentsUrl, deleteDepartmentUrl } from '../../../utils/helpers/apiUrls.js';
import { queryClient } from '../../../utils/helpers/http.js';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import { useSnackbar } from '../../../components/CustomSnackBar';
import Loading from '../../../components/Loading/index.jsx';

const DepartmentsPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const table = useCrudTable({
    url: departmentsUrl,
    defaultPageSize: 10,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteDepartmentUrl(id),
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', departmentsUrl] });
      showSnackbar('Department deleted successfully', 'success');
      setDeleteConfirm(null);
    },
    onError: () => {
      showSnackbar('Failed to delete department', 'error');
    },
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
    await deleteMutation.mutateAsync(deleteConfirm.id);
  };

  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    onOpenModal('Edit Department');
  };

  const handleAddClick = () => {
    setSelectedDepartment(null);
    onOpenModal('Add Department');
  };

  // Define columns for CrudTable with ActionMenu
  const columns = [
    {
      field: 'name',
      headerName: 'Department Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <CustomTypography sx={{ fontWeight: 500 }}>
          {params.row.name}
        </CustomTypography>
      ),
    },
    {
      field: 'head',
      headerName: 'Department Head',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const head = params.row.head;
        return head ? (
          <Chip
            label={head.name || head.email}
            size="small"
            variant="outlined"
          />
        ) : (
          <CustomTypography sx={{ color: 'text.secondary' }}>
            Unassigned
          </CustomTypography>
        );
      },
    },
    {
      field: 'members',
      headerName: 'Members',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const members = params.row.members;
        return members && members.length > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AvatarGroup
              max={3}
              sx={{
                '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.75rem' },
              }}
            >
              {members.map((member) => (
                <Avatar key={member.id} title={member.email}>
                  {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
            <CustomTypography variant="caption" sx={{ color: 'text.secondary' }}>
              {members.length}
            </CustomTypography>
          </Box>
        ) : (
          <CustomTypography sx={{ color: 'text.secondary' }}>
            No members
          </CustomTypography>
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
        No departments yet
      </Typography>
      <Button variant="contained" onClick={handleAddClick}>
        Create First Department
      </Button>
    </Box>
  );

  return (
    <>
      <OrganizationPageLayout
        title="Departments"
        subtitle="Manage your organization's departments"
        onActionClick={handleAddClick}
        actionLabel="+ New Department"
        showActionButton={!table.isLoading && table.rows && table.rows.length > 0}
      >
        {table.isLoading ? (
          <Loading message="Loading departments..." />
        ) : table.rows && (table.rows.length > 0 || table.filterModel.items.length > 0) ? (
          <CrudTable
            table={table}
            columns={columns}
            tableName="Departments"
            getRowId={(row) => row.id}
          />
        ) : (
          emptyState
        )}
      </OrganizationPageLayout>

      <DepartmentAddModal onSuccess={table.refetch} />
      {selectedDepartment && <DepartmentEditModal department={selectedDepartment} onSuccess={table.refetch} />}

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
    </>
  );
};

export default DepartmentsPage;
