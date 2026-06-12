# Context-Based Modal Pattern (HitchPay Style)

## Overview
The departments feature has been refactored to use a context-based modal system similar to HitchPay, making it reusable and accessible from anywhere in the application.

## Architecture

### 1. **ModalContextProvider** 
Location: `frontend/src/store/ModalContextProvider.jsx`

Manages global modal state with:
- `modalIsOpen` - Object containing `{open: boolean, action: string}`
- `onOpenModal(action)` - Opens modal with a specific action name
- `onCloseModal()` - Closes the modal

Already integrated in `App.jsx`

### 2. **CustomModal Component**
Location: `frontend/src/components/CustomModal/index.jsx`

Generic modal wrapper that:
- Uses ModalContext to manage open/close state
- Provides consistent styling with gradient border
- Handles title and close button
- Can be used anywhere in the app

### 3. **Department-Specific Components**

#### DepartmentForm.jsx
Form logic using TanStack React Form and Zod validation
- Handles all form field state management
- Separate from modal container (reusable)

#### DepartmentAddModal.jsx
Wraps DepartmentForm in CustomModal for creating departments
- Opens when `modalIsOpen.action === 'Add Department'`
- Manages create mutation and error handling

#### DepartmentEditModal.jsx
Wraps DepartmentForm in CustomModal for editing departments
- Opens when `modalIsOpen.action === 'Edit Department'`
- Manages update mutation and error handling
- Receives department data as prop

#### index.jsx (Departments Page)
Main page component that:
- Displays departments table
- Triggers modals via `onOpenModal('Action Name')`
- Conditionally renders `DepartmentAddModal` and `DepartmentEditModal`
- Handles delete confirmation dialog

## Usage Pattern

### Opening a Modal from Any Component
```jsx
import { useContext } from 'react';
import { ModalContext } from '../../store/ModalContextProvider.jsx';

const MyComponent = () => {
  const { onOpenModal } = useContext(ModalContext);
  
  return (
    <button onClick={() => onOpenModal('Add Department')}>
      Add New Department
    </button>
  );
};
```

### Creating a New Modal Feature

1. **Create Context Provider** (if adding new feature type)
```jsx
// src/context/YourFeatureContextProvider.jsx
import { createContext, useState } from 'react';

export const YourFeatureContext = createContext({
  featureData: null,
  setFeatureData: () => {},
});

const YourFeatureContextProvider = ({ children }) => {
  const [featureData, setFeatureData] = useState(null);
  
  return (
    <YourFeatureContext.Provider value={{ featureData, setFeatureData }}>
      {children}
    </YourFeatureContext.Provider>
  );
};

export default YourFeatureContextProvider;
```

2. **Create Form Component** (form logic only)
```jsx
// src/pages/feature/YourForm.jsx
const YourForm = ({ onSubmit, isLoading, data }) => {
  // Form implementation using TanStack React Form
};

export default YourForm;
```

3. **Create Modal Wrappers** (modal + form)
```jsx
// src/pages/feature/YourAddModal.jsx
import CustomModal from '../../../components/CustomModal/index.jsx';
import YourForm from './YourForm.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';

const YourAddModal = () => {
  const { onCloseModal } = useContext(ModalContext);
  const mutation = useYourMutation();
  
  const handleSubmit = async (data) => {
    await mutation.mutateAsync(data);
    onCloseModal();
  };
  
  return (
    <CustomModal title="Add New Item" maxWidth="sm">
      <YourForm onSubmit={handleSubmit} isLoading={mutation.isPending} />
    </CustomModal>
  );
};

export default YourAddModal;
```

4. **Use in Page Component**
```jsx
import { useContext } from 'react';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import YourAddModal from './YourAddModal.jsx';

const YourPage = () => {
  const { onOpenModal } = useContext(ModalContext);
  
  return (
    <>
      <button onClick={() => onOpenModal('Add Item')}>Add</button>
      <YourAddModal />
    </>
  );
};
```

## File Structure
```
frontend/src/
├── store/
│   └── ModalContextProvider.jsx (global modal state)
├── components/
│   └── CustomModal/
│       └── index.jsx (generic modal wrapper)
├── pages/
│   └── organization/
│       └── departments/
│           ├── schema.js (Zod validation)
│           ├── index.jsx (main page, uses context)
│           ├── DepartmentForm.jsx (form logic only)
│           ├── DepartmentAddModal.jsx (add wrapper)
│           └── DepartmentEditModal.jsx (edit wrapper)
└── utils/
    └── hooks/
        └── useDepartments.js (React Query hooks)
```

## Benefits

✅ **Reusable Modal Container** - CustomModal works for any modal content
✅ **Separation of Concerns** - Form logic separate from modal container
✅ **Global State** - Modal accessible from anywhere without prop drilling
✅ **Consistent UI** - All modals share the same styling and behavior
✅ **Easy to Scale** - Simple pattern to add more modal features
✅ **TanStack React Form** - Modern form state management with Zod validation
✅ **HitchPay Compatible** - Follows the same patterns as your existing codebase

## Next Steps

To add more modal-based features:
1. Copy the pattern from departments
2. Create Form, AddModal, EditModal components
3. Use the same ModalContext pattern
4. No need to create new context providers for each feature
