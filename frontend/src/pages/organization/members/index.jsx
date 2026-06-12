import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../../../layouts/LayoutContainers/DashboardLayout/index.jsx';
import MembersAddModal from './MembersAddModal.jsx';
import MembersEditModal from './MembersEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { useDeleteMember } from '../../../utils/hooks/useMembers.js';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { membersUrl } from '../../../utils/helpers/apiUrls.js';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import MembersTable from './MembersTable.jsx';

const MembersPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: membersResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: [membersUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: membersUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const members = membersResponse?.data?.results || [];
  const deleteMutation = useDeleteMember();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  };

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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Members
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your organization's team members
            </Typography>
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
        title="Delete Member"
        itemName={deleteConfirm?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default MembersPage;
