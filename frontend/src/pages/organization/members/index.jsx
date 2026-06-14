import { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../../../layouts/LayoutContainers/DashboardLayout/index.jsx';
import MembersAddModal from './MembersAddModal.jsx';
import MembersEditModal from './MembersEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { membersUrl, deleteMemberUrl, reactivateMemberUrl } from '../../../utils/helpers/apiUrls.js';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import MembersTable from './MembersTable.jsx';
import { useSnackbar } from '../../../components/CustomSnackBar';

const MembersPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hardDeleteConfirm, setHardDeleteConfirm] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const { data: membersResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: [membersUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: membersUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const members = membersResponse?.results || [];

  // Get current user's role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const response = await authorizedRequest({
          url: '/user/me/',
        });
        if (response.member?.role) {
          setCurrentUserRole(response.member.role);
        }
      } catch (err) {
        console.error('Failed to get user role:', err);
      }
    };
    getUserRole();
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: `${membersUrl}${id}/fire-member/`,
        method: 'POST',
        payload: {},
      }),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: `${membersUrl}${id}/delete-member/`,
        method: 'DELETE',
      }),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: reactivateMemberUrl(id),
        method: 'POST',
        payload: {},
      }),
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
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      showSnackbar('Member deactivated successfully', 'success');
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      showSnackbar('Failed to deactivate member', 'error');
    }
  };

  const handleHardDelete = async () => {
    try {
      await hardDeleteMutation.mutateAsync(hardDeleteConfirm.id);
      showSnackbar('Member permanently deleted', 'success');
      setHardDeleteConfirm(null);
      refetch();
    } catch (err) {
      showSnackbar('Failed to delete member', 'error');
    }
  };

  const handleReactivate = async (member) => {
    try {
      await reactivateMutation.mutateAsync(member.id);
      showSnackbar('Member reactivated successfully', 'success');
      refetch();
    } catch (err) {
      showSnackbar('Failed to reactivate member', 'error');
    }
  };

  const isOwner = currentUserRole === 'owner';

  const handleEditClick = (member) => {
    setSelectedMember(member);
    onOpenModal('Edit Member');
  };

  const handleAddClick = () => {
    setSelectedMember(null);
    onOpenModal('Add Member');
  };

  let content;

  if (isLoading) {
    content = <Loading message="Loading members..." />;
  } else if (isError) {
    content = <ErrorMessage message={error?.message || 'Failed to load members'} onRetry={refetch} />;
  } else if (members && members.length > 0) {
    content = (
      <MembersTable
        data={members}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onHardDelete={setHardDeleteConfirm}
        onReactivate={handleReactivate}
        isOwner={isOwner}
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
          No members yet
        </Typography>
        <Button variant="contained" onClick={handleAddClick}>
          Add First Member
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
                Members
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Manage your organization's team members
              </Typography>
            </Box>
          </Box>
          {members.length > 0 && (
            <Button variant="contained" onClick={handleAddClick}>
              + New Member
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        {content}
      </Box>

      <MembersAddModal onSuccess={refetch} />
      {selectedMember && <MembersEditModal member={selectedMember} onSuccess={refetch} />}

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
    </DashboardLayout>
  );
};

export default MembersPage;
