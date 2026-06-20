---
name: frontend-crud
description: CrudTable component and useCrudTable hook for OneUp AI — server-side pagination, sorting, filtering, and CRUD mutations. Read before building any data table.
when_to_use: Use when building a data table, list view, or any page that displays records from the API. Use when asked about pagination, sorting, search, CrudTable, useCrudTable, DataGrid, row actions, or delete confirmation. Triggers on "table", "list", "CRUD", "pagination", "data grid".
paths: frontend/**
---

# Frontend CRUD Tables

## Architecture

```
CrudTable (DataGrid wrapper)
  ↕ useCrudTable (React Query + server-side state)
    ↕ authorizedRequest()
      ↕ Django ViewSet (SearchFilter, OrderingFilter, PaginateItems)
```

## useCrudTable hook

```javascript
import { useCrudTable } from '@/components/CrudTable/useCrudTable';

const table = useCrudTable({
  url: resourcesUrl,          // required — imported from apiUrls.js
  defaultPageSize: 10,        // optional, default 10
});
```

Returns:
```javascript
{
  rows, rowCount, isLoading, error,
  paginationModel, sortModel, filterModel,
  onPaginationModelChange, onSortModelChange, onFilterModelChange,
  refetch,
}
```

Query cache key: `['crud-table', url]` — use this when invalidating after mutations.

## CrudTable component

```javascript
import CrudTable from '@/components/CrudTable';

<CrudTable
  table={table}              // useCrudTable result
  columns={columns}          // DataGrid column definitions
  tableName="Departments"    // shown as chip in toolbar
  getRowId={(row) => row.id} // default: row.id
/>
```

Built-in toolbar features: search (Enter to submit), column picker, filter panel, CSV export, refresh (clears all filters).

## Backend requirements
```python
filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
search_fields = ['name', 'description']
ordering_fields = ['id', 'name', 'created_at']
pagination_class = PaginateItems   # returns totalItems, not count
```

## Full page example

```javascript
import { useState, useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCrudTable } from '@/components/CrudTable/useCrudTable';
import CrudTable from '@/components/CrudTable';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ActionMenu from '@/components/ActionMenu';
import Loading from '@/components/Loading';
import { ModalContext } from '@/store/ModalContextProvider';
import { authorizedRequest, queryClient } from '@/utils/helpers/http';
import { resourcesUrl, deleteResourceUrl } from '@/utils/helpers/apiUrls';
import ResourceAddModal from './ResourceAddModal';
import ResourceEditModal from './ResourceEditModal';

export default function ResourcesPage() {
  const { onOpenModal } = useContext(ModalContext);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const table = useCrudTable({ url: resourcesUrl });

  const deleteMutation = useMutation({
    mutationFn: (id) => authorizedRequest({ url: deleteResourceUrl(id), method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', resourcesUrl] });
      setDeleteTarget(null);
    },
  });

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 100,
      renderCell: ({ row }) => (
        <Chip
          label={row.status}
          color={{ active: 'success', inactive: 'error', pending: 'warning' }[row.status] ?? 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      renderCell: ({ row }) => (
        <ActionMenu menuItems={[
          { label: 'Edit', action: () => { setEditTarget(row); onOpenModal('Edit Resource'); } },
          { label: 'Delete', color: 'error', action: () => setDeleteTarget(row) },
        ]} />
      ),
    },
  ];

  // Smart empty state: show table when data OR filter is active (0 results ≠ no data)
  const showTable = !table.isLoading && (table.rows?.length > 0 || table.filterModel.items.length > 0);

  return (
    <>
      {table.isLoading ? (
        <Loading message="Loading resources..." />
      ) : showTable ? (
        <CrudTable table={table} columns={columns} tableName="Resources" />
      ) : (
        <EmptyState onAction={() => onOpenModal('Add Resource')} />
      )}

      <ResourceAddModal onSuccess={table.refetch} />
      {editTarget && <ResourceEditModal resource={editTarget} onSuccess={table.refetch} />}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Resource"
        itemName={deleteTarget?.name ?? ''}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
```

## Column design

A good table is scannable. Decisions that make it so (general composition principles in `frontend-design`):

- **Alignment by type** — text and labels left, numbers and currency right (`align: 'right'`, `headerAlign: 'right'`), so digits line up and totals are comparable.
- **Status → chip, free text → plain** — use a `Chip` with a semantic color only for a small fixed set of states (active/inactive/pending). Don't chip-wrap ordinary text; it adds visual weight without meaning.
- **Show what the user scans for**, not every field. A table is a list to compare across, not a record dump — push full detail to the edit view. 4–6 meaningful columns beats 12 cramped ones.
- **Actions go last**, in a narrow non-sortable column, via `ActionMenu` (keeps the row clean and the action set consistent).
- **Give text columns room** with `flex` + a sensible `minWidth` so they don't truncate on first load; keep fixed-width columns (status, actions) narrow.

## Designed states (don't ship only the populated table)

Distinguish the three non-populated states — they need different UI (the general principle is in `frontend-design`):

```javascript
// Smart state selection: 0 results from a filter ≠ no data at all
const hasFilter = table.filterModel.items.length > 0;
const hasRows = table.rows?.length > 0;

if (table.isLoading) return <Loading message="Loading resources..." />;
if (table.error)     return <ErrorMessage message={table.error?.message} />;

// No data yet → invite the first action. 0 search results → keep the table chrome.
const showTable = hasRows || hasFilter;
```

A good "no data yet" empty state is an invitation — an icon, one plain line, and the primary action:

```javascript
function EmptyState({ onAction }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
      <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
      <Typography sx={{ color: 'text.secondary' }}>No resources yet.</Typography>
      <Button variant="contained" onClick={onAction}>Create resource</Button>
    </Box>
  );
}
```

When a filter returns nothing, leave `CrudTable` mounted — its toolbar shows "0 items" and lets the user clear the search. Don't swap in the create-first-item screen there.

## Column patterns (examples)

### Avatar + name
```javascript
renderCell: ({ row }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Avatar sx={{ width: 32, height: 32 }}>{row.name?.charAt(0).toUpperCase()}</Avatar>
    <Typography sx={{ fontWeight: 500 }}>{row.name}</Typography>
  </Box>
)
```

### Related object
```javascript
renderCell: ({ row }) => row.department
  ? <Chip label={row.department.name} size="small" />
  : <Typography sx={{ color: 'text.secondary' }}>Unassigned</Typography>
```

## Add/Edit modal pattern

```javascript
// ResourceAddModal.jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { ModalContext } from '@/store/ModalContextProvider';
import GeneralForm from '@/components/GeneralForm';
import CustomModal from '@/components/CustomModal';
import { authorizedRequest } from '@/utils/helpers/http';
import { createResourceUrl, resourcesUrl } from '@/utils/helpers/apiUrls';
import { z } from 'zod';

export default function ResourceAddModal({ onSuccess }) {
  const { onCloseModal } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => authorizedRequest({ url: createResourceUrl, method: 'POST', payload: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud-table', resourcesUrl] });
      onCloseModal();
      onSuccess?.();
    },
  });

  // schema = field-config object (not a z.object()) — see frontend-forms/SKILL.md
  const schema = {
    name: { value: '', validation: z.string().min(1, 'Required'), type: 'text', label: 'Name' },
  };

  return (
    <CustomModal title="Add Resource" onClose={onCloseModal}>
      <GeneralForm
        schema={schema}
        onSubmit={(data) => mutation.mutate(data)}
        buttonText={mutation.isPending ? 'Creating...' : 'Create'}
      />
    </CustomModal>
  );
}
```

## API response formats — all supported automatically
```json
{ "totalItems": 100, "results": [...] }   // PaginateItems (this app's paginator)
{ "count": 100, "results": [...] }        // DRF standard
{ "total": 100, "results": [...] }        // custom
[{...}]                                   // plain array
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Table shows 0 items but data exists | Check API returns `totalItems`, `count`, or `total` |
| Search not working | Backend: add `SearchFilter` + `search_fields` |
| Sort icons missing | Backend: add `OrderingFilter` + `ordering_fields` |
| Empty state shows when search returns 0 | Use smart empty state: `rows.length > 0 || filterModel.items.length > 0` |
