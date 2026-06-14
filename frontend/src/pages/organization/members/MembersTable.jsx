import { Box, Avatar, Chip } from '@mui/material';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import SimpleTable from '../../../components/SimpleTable/index.jsx';

const MembersTable = ({ data, onEdit, onDelete, onHardDelete, onReactivate, isOwner }) => {
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
            action: () => onEdit(params.row),
          },
        ];

        if (params.row.is_active) {
          menuItems.push({
            label: 'Deactivate',
            color: 'error',
            action: () => onDelete(params.row),
          });
        } else {
          menuItems.push({
            label: 'Reactivate',
            color: 'success',
            action: () => onReactivate(params.row),
          });
        }

        if (isOwner) {
          menuItems.push({
            label: 'Delete',
            color: 'error',
            action: () => onHardDelete(params.row),
          });
        }

        return <ActionMenu menuItems={menuItems} />;
      },
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
