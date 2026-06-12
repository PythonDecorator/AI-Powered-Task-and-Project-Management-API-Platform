import { Box, Avatar, AvatarGroup, Chip } from '@mui/material';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import SimpleTable from '../../../components/SimpleTable/index.jsx';

const DepartmentTable = ({ data, onEdit, onDelete }) => {
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
              action: () => onEdit(params.row),
            },
            {
              label: 'Delete',
              color: 'error',
              action: () => onDelete(params.row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <SimpleTable
      title="Departments"
      columns={columns}
      rows={data}
      getRowId={(row) => row.id}
    />
  );
};

export default DepartmentTable;
