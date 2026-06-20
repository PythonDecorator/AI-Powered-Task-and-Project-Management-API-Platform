import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Avatar, Chip, Typography, Button } from '@mui/material';
import { useCrudTable } from '../../../components/CrudTable/useCrudTable';
import CrudTable from '../../../components/CrudTable';
import OrganizationPageLayout from '../OrganizationLayout.jsx';
import MembersAddModal from './MembersAddModal.jsx';
import MembersEditModal from './MembersEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { membersUrl, deleteMemberUrl, reactivateMemberUrl } from '../../../utils/helpers/apiUrls.js';
import { queryClient } from '../../../utils/helpers/http.js';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import { useNotifications } from '../shared';
import Loading from '../../../components/Loading/index.jsx';

const MembersPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { show: showNotification } = useNotifications();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hardDeleteConfirm, setHardDeleteConfirm] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const table = useCrudTable({
    url: membersUrl,
    defaultPageSize: 5,
  });

  const { data: userMeData } = useQuery({
    queryKey: ['/user/me/'],
    queryFn: ({ signal }) => authorizedRequest({ url: '/user/me/', signal }),
    staleTime: 30 * 60 * 1000,
  });

  const isOwner = userMeData?.member?.role === 'owner';

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: `${membersUrl}${id}/fire-member/`,
        method: 'POST',
        payload: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', membersUrl] });
      showNotification('Member deactivated successfully', { severity: 'success' });
      setDeleteConfirm(null);
    },
    onError: () => {
      showNotification('Failed to deactivate member', { severity: 'error' });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: `${membersUrl}${id}/delete-member/`,
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', membersUrl] });
      showNotification('Member permanently deleted', { severity: 'success' });
      setHardDeleteConfirm(null);
    },
    onError: () => {
      showNotification('Failed to delete member', { severity: 'error' });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: reactivateMemberUrl(id),
        method: 'POST',
        payload: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', membersUrl] });
      showNotification('Member reactivated successfully', { severity: 'success' });
    },
    onError: () => {
      showNotification('Failed to reactivate member', { severity: 'error' });
    },
  });

  const getDeleteWarnings = (member) => {
    const warnings = [];
    if (member.department_head_of) {
      warnings.push(`Department head of ${member.department_head_of.name}`);
    }
    if (member.direct_reports && member.direct_reports.length > 0) {
      warnings.push(`Has ${member.direct_reports.length} direct report(s)`);
    }
    return warnings;
  };

  const handleDeleteClick = (member) => {
    setDeleteConfirm({
      ...member,
      warnings: getDeleteWarnings(member),
    });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteConfirm.id);
  };

  const handleHardDelete = async () => {
    await hardDeleteMutation.mutateAsync(hardDeleteConfirm.id);
  };

  const handleReactivate = async (member) => {
    await reactivateMutation.mutateAsync(member.id);
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);
    onOpenModal('Edit Member');
  };

  const handleAddClick = () => {
    setSelectedMember(null);
    onOpenModal('Add Member');
  };

  // Define columns for CrudTable with ActionMenu in the actions column
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.name?.charAt(0).toUpperCase() || params.row.email.charAt(0).toUpperCase()}
          </Avatar>
          <CustomTypography sx={{ fontWeight: 500 }}>
            {params.row.name || params.row.email}
          </CustomTypography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <CustomTypography sx={{ color: 'text.secondary' }}>
          {params.row.email}
        </CustomTypography>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const roleColors = {
          admin: 'error',
          manager: 'info',
          member: 'default',
        };
        const roleColor = roleColors[params.row.role] || 'default';
        return (
          <Chip
            label={params.row.role || 'N/A'}
            size="small"
            color={roleColor}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'is_active',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const isActive = params.row.is_active;
        const hasUser = !!params.row.user;

        let label, color;
        if (!hasUser) {
          label = 'Pending';
          color = 'warning';
        } else if (isActive) {
          label = 'Active';
          color = 'success';
        } else {
          label = 'Inactive';
          color = 'error';
        }

        return (
          <Chip
            label={label}
            size="small"
            color={color}
            variant="filled"
          />
        );
      },
    },
    {
      field: 'departments',
      headerName: 'Departments',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const departments = params.row.departments;
        return departments && departments.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {departments.map((dept) => (
              <Chip
                key={dept.id}
                label={dept.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        ) : (
          <CustomTypography sx={{ color: 'text.secondary' }}>
            Unassigned
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
      renderCell: (params) => {
        const menuItems = [
          {
            label: 'Edit',
            action: () => handleEditClick(params.row),
          },
        ];

        if (params.row.is_active) {
          menuItems.push({
            label: 'Deactivate',
            color: 'error',
            action: () => handleDeleteClick(params.row),
          });
        } else {
          menuItems.push({
            label: 'Reactivate',
            color: 'success',
            action: () => handleReactivate(params.row),
          });
        }

        if (isOwner) {
          menuItems.push({
            label: 'Delete',
            color: 'error',
            action: () => setHardDeleteConfirm(params.row),
          });
        }

        return <ActionMenu menuItems={menuItems} />;
      },
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
        No members yet
      </Typography>
      <Button variant="contained" onClick={handleAddClick}>
        Add First Member
      </Button>
    </Box>
  );

  return (
    <>
      <OrganizationPageLayout
        title="Members"
        subtitle="Manage your organization's team members"
        onActionClick={handleAddClick}
        actionLabel="+ New Member"
        showActionButton={!table.isLoading && table.rows && table.rows.length > 0}
      >
        {table.isLoading ? (
          <Loading message="Loading members..." />
        ) : table.rows && (table.rows.length > 0 || table.filterModel.items.length > 0) ? (
          <CrudTable
            table={table}
            columns={columns}
            tableName="Members"
            getRowId={(row) => row.id}
          />
        ) : (
          emptyState
        )}
      </OrganizationPageLayout>

      <MembersAddModal onSuccess={table.refetch} />
      {selectedMember && <MembersEditModal member={selectedMember} onSuccess={table.refetch} />}

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title="Deactivate Member"
        itemName={deleteConfirm?.name || ''}
        warnings={deleteConfirm?.warnings || []}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteMutation.isPending}
        requireTypeConfirm={true}
        showReason={false}
      />

      <DeleteConfirmDialog
        open={!!hardDeleteConfirm}
        title="Permanently Delete Member"
        itemName={hardDeleteConfirm?.name || ''}
        warnings={['This action is irreversible. All member data will be permanently deleted.']}
        onConfirm={handleHardDelete}
        onCancel={() => setHardDeleteConfirm(null)}
        isLoading={hardDeleteMutation.isPending}
        requireTypeConfirm={true}
        showReason={false}
      />
    </>
  );
};

export default MembersPage;
