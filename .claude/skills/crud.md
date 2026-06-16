# CRUD Operations Pattern & Guide

## Overview
Production-grade CRUD system using React Query, MUI DataGrid, and Django REST Framework. Supports server-side pagination, filtering, sorting, and search with intelligent UI patterns.

---

## Architecture

```
Frontend: CrudTable (DataGrid) + useCrudTable (React Query) + CrudTableHeader (Search/Filters)
           ↓
useQuery: Server-side data management, caching, retry logic
           ↓
Backend: ViewSet with SearchFilter, OrderingFilter, Pagination
           ↓
API: /api/v1/{resource}/?search=term&page=1&page_size=10&ordering=field
```

---

## Quick Start: Creating a CRUD Page

### 1. **Backend Setup** (Django ViewSet)

```python
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from utils.helpers import PaginateItems

from . import serializers
from .models import YourModel
from .permissions import CanManageResource

class ManageResourceAPIView(viewsets.ModelViewSet):
    """CRUD for resources scoped to authenticated user's organization."""
    
    serializer_class = serializers.YourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, CanManageResource]
    
    # Pagination & filtering
    pagination_class = PaginateItems
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']  # Fields to search
    ordering_fields = ['id', 'name', 'created_at']
    
    queryset = YourModel.objects.none()
    
    def get_queryset(self):
        """Scope to authenticated user's organization."""
        return (
            YourModel.objects
            .filter(organization=self.request.user.member.organization)
            .select_related('organization')  # Optimize queries
            .prefetch_related('related_items')
        )
    
    def list(self, request, *args, **kwargs):
        """List with pagination."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "ok": True,
            "results": serializer.data,
            "count": queryset.count()
        })
```

**Key Points**:
- ✅ Use `PaginateItems` (returns `totalItems`, not `count`)
- ✅ Configure `search_fields` for searchable columns
- ✅ Configure `ordering_fields` for sortable columns
- ✅ `get_queryset()` must scope to organization
- ✅ Use `select_related()` and `prefetch_related()` for performance

---

### 2. **Frontend: Create Page Component**

```jsx
import { useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';

import { useCrudTable } from '../../../components/CrudTable/useCrudTable';
import CrudTable from '../../../components/CrudTable';
import OrganizationPageLayout from '../OrganizationLayout.jsx';
import ResourceAddModal from './ResourceAddModal.jsx';
import ResourceEditModal from './ResourceEditModal.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { resourcesUrl, deleteResourceUrl } from '../../../utils/helpers/apiUrls.js';
import { queryClient } from '../../../utils/helpers/http.js';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog/index.jsx';
import ActionMenu from '../../../components/ActionMenu/index.jsx';
import Loading from '../../../components/Loading/index.jsx';

const ResourcesPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  // Step 1: Initialize table with server-side pagination/filtering
  const table = useCrudTable({
    url: resourcesUrl,
    defaultPageSize: 10,
  });

  // Step 2: Delete mutation with cache invalidation
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteResourceUrl(id),
        method: 'DELETE',
      }),
    onSuccess: () => {
      // Invalidate cache to trigger automatic refetch
      queryClient.invalidateQueries({ queryKey: ['crud-table', resourcesUrl] });
      showSnackbar('Resource deleted successfully', 'success');
      setDeleteConfirm(null);
    },
    onError: () => {
      showSnackbar('Failed to delete resource', 'error');
    },
  });

  // Step 3: Define columns for DataGrid
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 500 }}>
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <Typography sx={{ color: 'text.secondary' }}>
          {params.row.description || 'N/A'}
        </Typography>
      ),
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
              action: () => {
                setSelectedResource(params.row);
                onOpenModal('Edit Resource');
              },
            },
            {
              label: 'Delete',
              color: 'error',
              action: () => setDeleteConfirm(params.row),
            },
          ]}
        />
      ),
    },
  ];

  // Step 4: Empty state for first load
  const emptyState = (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: 2 }}>
      <Typography variant="h6" sx={{ color: 'text.secondary' }}>
        No resources yet
      </Typography>
      <Button variant="contained" onClick={() => onOpenModal('Add Resource')}>
        Create First Resource
      </Button>
    </Box>
  );

  // Step 5: Render with smart empty state logic
  return (
    <>
      <OrganizationPageLayout
        title="Resources"
        subtitle="Manage your organization's resources"
        onActionClick={() => onOpenModal('Add Resource')}
        actionLabel="+ New Resource"
        showActionButton={!table.isLoading && table.rows && table.rows.length > 0}
      >
        {table.isLoading ? (
          <Loading message="Loading resources..." />
        ) : table.rows && (table.rows.length > 0 || table.filterModel.items.length > 0) ? (
          <CrudTable
            table={table}
            columns={columns}
            tableName="Resources"
            getRowId={(row) => row.id}
          />
        ) : (
          emptyState
        )}
      </OrganizationPageLayout>

      <ResourceAddModal onSuccess={table.refetch} />
      {selectedResource && <ResourceEditModal resource={selectedResource} onSuccess={table.refetch} />}

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title="Delete Resource"
        itemName={deleteConfirm?.name || ''}
        warnings={[]}
        onConfirm={() => deleteMutation.mutateAsync(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteMutation.isPending}
        requireTypeConfirm={true}
        showReason={false}
      />
    </>
  );
};

export default ResourcesPage;
```

**Key Points**:
- ✅ Initialize `useCrudTable` with `url` and `defaultPageSize`
- ✅ Use mutations with `queryClient.invalidateQueries()` for auto-refetch
- ✅ Define columns array with `field`, `headerName`, `renderCell`
- ✅ Smart empty state: show table if rows OR filter active
- ✅ Pass `table.refetch` to modals for data refresh

---

## Component Reference

### `useCrudTable` Hook

**Usage**:
```javascript
const table = useCrudTable({
  url: '/api/v1/resources/',           // Required: API endpoint
  defaultPageSize: 10,                  // Optional: default 10
  transformData: (response) => ({      // Optional: transform API response
    items: response.data,
    itemCount: response.total,
  }),
  staleTime: 5 * 60 * 1000,            // Optional: 5 min default
  onError: (error) => console.error(error), // Optional: error callback
});
```

**Returns**:
```javascript
{
  rows: [],                              // Current page data
  rowCount: 0,                           // Total items
  isLoading: false,                      // Loading state
  error: null,                           // Error object
  paginationModel: { page: 0, pageSize: 10 },
  sortModel: [],
  filterModel: { items: [] },
  onPaginationModelChange: (model) => {},
  onSortModelChange: (model) => {},
  onFilterModelChange: (model) => {},
  refetch: () => {},                     // Manual refetch
}
```

---

### `CrudTable` Component

**Usage**:
```jsx
<CrudTable
  table={table}           // Required: useCrudTable hook result
  columns={columns}       // Required: column definitions
  tableName="Resources"   // Optional: displays as chip
  onCreate={handleCreate} // Optional: create button handler
  createLabel="New"       // Optional: button label
  getRowId={(row) => row.id} // Optional: row key function
  sx={{}}                 // Optional: MUI sx prop
/>
```

**Features**:
- ✅ Server-side pagination (click page numbers)
- ✅ Server-side sorting (click column headers)
- ✅ Search/filter support (refresh button clears all)
- ✅ Column customization (columns button in toolbar)
- ✅ Export data (export button in toolbar)
- ✅ Responsive layout
- ✅ Loading state with circular progress

---

### `CrudTableHeader` Component (Built-in)

**Features**:
- Search box (click search icon to toggle)
- Type freely → no API calls
- Press Enter or click "Search" button to trigger
- Click X to clear search
- Refresh button (clears filters, resets pagination)
- Columns menu
- Filter button
- Export button

**Automatic**: Included in `CrudTable`, no manual configuration needed.

---

## Search & Filtering

### Frontend Search

```javascript
// Search is automatically triggered by CrudTableHeader
// User types → presses Enter or clicks Search button
// Converts to filter model:
{
  items: [
    {
      field: 'name',
      operator: 'contains',
      value: 'search-term',
    }
  ],
  linkOperator: 'and',
}
```

### Backend Search

In your ViewSet, configure searchable fields:

```python
search_fields = ['name', 'description', 'status']

# Django REST Framework SearchFilter will then handle:
# GET /api/v1/resources/?search=term
# Searches name, description, status fields
```

### Result: Search Returns 0 Items

When search returns 0 results:
- ✅ Table still displays (with "0 items" chip)
- ✅ No empty state message (distinguishes "no data yet" vs "0 results")
- ✅ Shows toolbar with filters
- ✅ User can clear search with X button

---

## Common Patterns

### Pattern 1: Add Relationship Column

```javascript
{
  field: 'department',
  headerName: 'Department',
  flex: 1,
  minWidth: 180,
  renderCell: (params) => {
    const dept = params.row.department;
    return dept ? (
      <Chip label={dept.name} size="small" />
    ) : (
      <Typography sx={{ color: 'text.secondary' }}>Unassigned</Typography>
    );
  },
}
```

### Pattern 2: Status Badge Column

```javascript
{
  field: 'status',
  headerName: 'Status',
  flex: 0.8,
  minWidth: 100,
  renderCell: (params) => {
    const statusColors = {
      active: 'success',
      inactive: 'error',
      pending: 'warning',
    };
    return (
      <Chip
        label={params.row.status}
        color={statusColors[params.row.status]}
        size="small"
      />
    );
  },
}
```

### Pattern 3: Avatar Column

```javascript
{
  field: 'name',
  headerName: 'Name',
  flex: 1,
  minWidth: 200,
  renderCell: (params) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar sx={{ width: 32, height: 32 }}>
        {params.row.name?.charAt(0).toUpperCase()}
      </Avatar>
      <Typography sx={{ fontWeight: 500 }}>
        {params.row.name}
      </Typography>
    </Box>
  ),
}
```

### Pattern 4: Custom Modal Add/Edit

```jsx
const ResourceAddModal = ({ onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();

  const createMutation = useMutation({
    mutationFn: (data) =>
      authorizedRequest({
        url: resourcesUrl,
        method: 'POST',
        payload: data,
      }),
    onSuccess: () => {
      showSnackbar('Resource created', 'success');
      onCloseModal();
      onSuccess?.(); // Trigger parent refetch
    },
    onError: () => showSnackbar('Failed to create', 'error'),
  });

  return (
    <CustomModal
      title="Add Resource"
      onClose={onCloseModal}
    >
      <GeneralForm
        schema={z.object({
          name: z.string().min(1, 'Required'),
          description: z.string().optional(),
        })}
        onSubmit={(data) => createMutation.mutateAsync(data)}
        submitLabel="Create"
        isLoading={createMutation.isPending}
      />
    </CustomModal>
  );
};
```

---

## API Response Formats

The hook automatically detects and handles:

### Format 1: DRF Standard
```json
{
  "count": 100,
  "next": "...",
  "previous": null,
  "results": [...]
}
```

### Format 2: Custom Total
```json
{
  "total": 100,
  "results": [...]
}
```

### Format 3: PaginateItems (This App)
```json
{
  "totalItems": 100,
  "countItemsOnPage": 10,
  "currentPage": 1,
  "totalPages": 10,
  "next": "...",
  "previous": null,
  "results": [...]
}
```

### Format 4: Array
```json
[{...}, {...}]
```

All are supported automatically. No special configuration needed.

---

## Performance Tips

1. **Use `select_related()` and `prefetch_related()`**
   - Reduces database queries
   - Required in `get_queryset()`

2. **Pagination defaults to 10**
   - Users can change via "Rows per page" dropdown
   - Max allowed: 25 (configurable in `PaginateItems`)

3. **Cache management**
   - Stale time: 5 minutes (refetch if data older than 5 min)
   - Cache time: 10 minutes (keep in memory 10 min after last access)
   - Mutations invalidate cache (auto-refetch)

4. **Avoid N+1 queries**
   - Always optimize with select/prefetch
   - Test with `django-debug-toolbar`

---

## Troubleshooting

### Issue: Table shows 0 items but should have data
**Solution**: Check API response has `count`, `total`, or `totalItems` field. Hook falls back to `array.length` if none exist.

### Issue: Search not working
**Solution**: 
1. Backend: Add `SearchFilter` to `filter_backends`
2. Backend: Add `search_fields = ['name', ...]` to ViewSet
3. Frontend: Check hook is initialized with correct URL

### Issue: Sorting not working
**Solution**:
1. Backend: Add `OrderingFilter` to `filter_backends`
2. Backend: Add `ordering_fields = ['name', ...]` to ViewSet
3. DataGrid will add sort icons to configured fields

### Issue: Empty state showing when search returns 0
**Solution**: Use smart empty state logic: `table.rows && (table.rows.length > 0 || table.filterModel.items.length > 0)`

---

## Best Practices

✅ Always use `useCrudTable` for server-side operations  
✅ Always use mutations with `queryClient.invalidateQueries()` for cache invalidation  
✅ Always pass `table.refetch` to child modals  
✅ Always configure `search_fields` and `ordering_fields` in backend  
✅ Always use `select_related()` and `prefetch_related()` for queries  
✅ Always define `getRowId` (default: `(row) => row.id`)  
✅ Always handle loading/error states with `<Loading />` and `<ErrorMessage />`  

❌ Don't use `useEffect` for pagination/sorting (DataGrid handles it)  
❌ Don't hardcode URLs (use `apiUrls.js`)  
❌ Don't forget to scope queries to organization  
❌ Don't skip request signal handling (causes memory leaks)  
❌ Don't manually refetch when you can invalidate cache  
