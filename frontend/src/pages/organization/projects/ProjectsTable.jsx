import { Box, Chip } from '@mui/material';
import CustomTypography from '../../../components/CustomTypography/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import SimpleTable from '../../../components/SimpleTable/index.jsx';

const ProjectsTable = ({ data, onEdit, onDelete }) => {
  const columns = [
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <CustomTypography sx={{ fontWeight: 500 }}>
          {params.row.name}
        </CustomTypography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <CustomTypography sx={{ color: 'text.secondary' }}>
          {params.row.description || 'No description'}
        </CustomTypography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const statusColors = {
          active: 'success',
          inactive: 'default',
          completed: 'info',
          on_hold: 'warning',
        };
        const statusColor = statusColors[params.row.status] || 'default';
        return (
          <Chip
            label={params.row.status || 'N/A'}
            size="small"
            color={statusColor}
            variant="outlined"
          />
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
      title="Projects"
      columns={columns}
      rows={data}
      getRowId={(row) => row.id}
    />
  );
};

export default ProjectsTable;
