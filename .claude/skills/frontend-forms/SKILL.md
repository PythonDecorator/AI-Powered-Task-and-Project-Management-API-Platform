---
name: frontend-forms
description: GeneralForm component API and form-building patterns for OneUp AI. All forms must use GeneralForm with Zod validation and useMutation for submission — no custom form logic.
when_to_use: Use when building any form — create, edit, filter, or login forms. Use when asked about form fields, Zod validation, select options, date pickers, form sections, edit mode pre-filling, or form submission. Triggers on "form", "input", "validation", "GeneralForm", "schema".
paths: frontend/**
---

# Frontend Forms

All forms use `GeneralForm` with Zod field validation. Submissions go through `useMutation` — see `frontend-http` for the full mutation pattern. Never build custom form state or write raw `authorizedRequest()` calls in submit handlers.

## Form UX
The API is below; these are the choices that make a form easy to fill (general composition in `frontend-design`):

- **Order fields the way the user thinks** — identity first (name, email), then details, then optional fields last. Don't mirror the database column order.
- **Section once a form passes ~6 fields.** Use `sections` to group ("Personal", "Work") so the form reads as a few short steps instead of one long wall. Below ~6 fields, no sections.
- **Modal vs page**: a short create/edit form (a few fields) belongs in a `CustomModal`. A long or multi-section form deserves its own page — a tall modal that scrolls is worse than a page.
- **Write labels and the submit button as outcomes** — label "Department name", button "Create department" (not "Submit"). Keep helper text to genuinely useful hints, not restating the label.
- **One primary submit.** Cancel is secondary (`text`/`outlined`), never a second contained button.
- Surface server errors from the mutation near the form, in plain language — see designed error handling in `frontend-design`.

## GeneralForm props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `schema` | object | ✓ | Field definitions (see below) |
| `onSubmit` | async func | ✓ | Called with `{ fieldName: value }` on valid submit |
| `buttonText` | string | | Submit button label (default: "Submit") |
| `sections` | object | | Group fields into titled sections |
| `fieldProps` | object | | Per-field prop overrides |
| `children` | ReactNode | | Content rendered after fields, before the button |

**Source:** `frontend/src/components/GeneralForm/GeneralForm.jsx`

## Schema structure

```javascript
const schema = {
  fieldName: {
    value: '',                          // initial value
    validation: z.string().min(1),      // Zod validator
    type: 'text',                       // field type (see below)
    label: 'Field Label',
    placeholder: 'Enter text...',
    required: true,                     // shows asterisk
    disabled: false,
    options: [],                        // for select / autocomplete
    onChangeListener: (value, form) => {} // optional — fires when this field changes
  }
};
```

## Field types

### Text variants — `type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'`
```javascript
name: { value: '', validation: z.string().min(1, 'Required'), type: 'text', label: 'Name' }
email: { value: '', validation: z.string().email('Invalid email'), type: 'email', label: 'Email' }
password: { value: '', validation: z.string().min(8, 'Min 8 chars'), type: 'password', label: 'Password' }
```

### Single select — `type: 'select'` (no `multiple`)
```javascript
role: {
  value: '',
  validation: z.string().min(1, 'Select a role'),
  type: 'select',
  label: 'Role',
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ],
}
```

### Multi-select — `type: 'select'` + `multiple: true`
```javascript
permissions: {
  value: [],
  validation: z.array(z.string()).min(1, 'Select at least one'),
  type: 'select',
  multiple: true,
  label: 'Permissions',
  options: [{ label: 'Read', value: 'read' }, { label: 'Write', value: 'write' }],
}
```

### Date picker — `type: 'date'`
```javascript
startDate: {
  value: '2024-06-18',   // ISO YYYY-MM-DD — this is what the backend receives
  validation: z.string().refine((d) => dayjs(d).isValid(), 'Invalid date'),
  type: 'date',
  label: 'Start Date',
}
```

### Checkbox — NOT a supported field type
`type: 'checkbox'` does not exist in `FormInputField.jsx`. Before building a boolean field, check if it has been added. If not, use a two-option select as a stopgap:
```javascript
active: {
  value: '',
  validation: z.string().refine((v) => v === 'true', 'Required'),
  type: 'select',
  label: 'Active?',
  options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }],
}
```

## Create form — wiring schema to a mutation

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import GeneralForm from '@/components/GeneralForm';
import { authorizedRequest } from '@/utils/helpers/http';
import { createDepartmentUrl, departmentsUrl } from '@/utils/helpers/apiUrls';
import { z } from 'zod';

export default function CreateDepartmentForm({ onClose }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formData) => authorizedRequest({ url: createDepartmentUrl, method: 'POST', payload: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [departmentsUrl] });
      onClose?.();
    },
  });

  const schema = {
    name: { value: '', validation: z.string().min(1, 'Required'), type: 'text', label: 'Department Name', required: true },
    description: { value: '', validation: z.string().optional(), type: 'text', label: 'Description' },
  };

  return (
    <GeneralForm
      schema={schema}
      onSubmit={(data) => mutation.mutate(data)}
      buttonText={mutation.isPending ? 'Creating...' : 'Create'}
    />
  );
}
```

## Edit mode — pre-fill schema from existing data

```javascript
const schema = {
  name: {
    value: existingData.name,       // pre-fill from fetched record
    validation: z.string().min(1),
    type: 'text',
    label: 'Name',
  },
};

// mutation uses PATCH:
mutationFn: (formData) => authorizedRequest({
  url: updateDepartmentUrl(existingData.id),
  method: 'PATCH',
  payload: formData,
})
```

## Form in a modal

```javascript
import { useState } from 'react';
import CustomModal from '@/components/CustomModal';
import GeneralForm from '@/components/GeneralForm';

export default function DepartmentPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Department</Button>
      <CustomModal open={open} onClose={() => setOpen(false)} title="Create Department">
        <CreateDepartmentForm onClose={() => setOpen(false)} />
      </CustomModal>
    </>
  );
}
```

## Sections — grouping fields

```javascript
const sections = {
  'Personal Information': ['firstName', 'lastName', 'email'],
  'Work Information': ['department', 'role'],
};

<GeneralForm schema={schema} onSubmit={handleSubmit} sections={sections} />
```

## Field prop overrides

```javascript
const fieldProps = {
  email: { disabled: true, placeholder: 'your@company.com' },
};

<GeneralForm schema={schema} onSubmit={handleSubmit} fieldProps={fieldProps} />
```

## Dynamic options with onChangeListener

The `onChangeListener` fires when the **field it is defined on** changes:
```javascript
state: {
  value: '',
  type: 'select',
  label: 'State',
  options: [],
  onChangeListener: async (newValue, form) => {
    // newValue = the new value of the 'state' field
    // form = form instance (setFieldValue, getFieldValue, etc.)
    form.setFieldValue('city', '');  // reset dependent field
  },
},
```

To react to **another** field changing, define the listener on that field and update the dependent field from it:
```javascript
country: {
  type: 'select',
  options: [...],
  onChangeListener: async (selectedCountry, form) => {
    const states = await fetchStates(selectedCountry);
    // update state field options via form API
  },
},
```

## Validation patterns

```javascript
z.string().min(1, 'Required')
z.string().email('Invalid email')
z.string().min(8).max(50)
z.number().min(1).max(100)
z.array(z.string()).min(1, 'Select at least one')
z.string().refine((v) => v !== 'forbidden', 'Not allowed')
```

## Submit button states

| State | Button | Spinner |
|-------|--------|---------|
| Idle | enabled | — |
| Invalid | disabled | — |
| Submitting | disabled | ✓ |
| Success/Error | re-enabled | — |

Spinner and disabled state are automatic. Reflect loading state in `buttonText` using `mutation.isPending`.

## Testing forms — minimum coverage

1. Fill required field → submit blocked until valid
2. Blur a field → its error (if any) becomes visible
3. Submit with valid data → `onSubmit` called with `{ fieldName: value }`
4. Submit with invalid data → `onSubmit` not called, errors shown

Check timing behaviour in `GeneralForm.jsx` before writing tests — don't assume debounce duration.
