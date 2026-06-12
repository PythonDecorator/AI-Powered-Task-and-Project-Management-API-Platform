import { Box, Avatar, Chip } from '@mui/material';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import SimpleTable from '../../../components/SimpleTable/index.jsx';

const MembersTable = ({ data, onEdit, onDelete }) => {
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
      field: 'department',
      headerName: 'Department',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const department = params.row.department;
        return department ? (
          <CustomTypography sx={{ color: 'text.secondary' }}>
            {department.name || 'Unassigned'}
          </CustomTypography>
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
      title="Members"
      columns={columns}
      rows={data}
      getRowId={(row) => row.id}
    />
  );
};

export default MembersTable;
