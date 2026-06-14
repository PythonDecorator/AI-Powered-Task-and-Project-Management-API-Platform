import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { createMemberUrl } from '../../../utils/helpers/apiUrls.js';
import { useSnackbar } from '../../../components/CustomSnackBar';

const MembersAddModal = ({ onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();

  const createMutation = useMutation({
    mutationFn: (data) =>
      authorizedRequest({
        url: createMemberUrl,
        method: 'POST',
        payload: data,
      }),
  });

  const schema = {
    name: {
      value: '',
      validation: z.string().min(1, 'Full name is required').max(100),
      type: 'text',
      label: 'Full Name',
      placeholder: 'e.g., John Doe',
      required: true,
    },
    email: {
      value: '',
      validation: z.string().email('Invalid email format'),
      type: 'text',
      label: 'Email',
      placeholder: 'john@company.com',
      required: true,
    },
    working: {
      value: 'Full-time',
      validation: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
      type: 'select',
      label: 'Employment Type',
      placeholder: 'Select employment type',
      options: [
        { label: 'Full-time', value: 'Full-time' },
        { label: 'Part-time', value: 'Part-time' },
        { label: 'Contract', value: 'Contract' },
        { label: 'Intern', value: 'Intern' },
      ],
      required: true,
    },
    salary: {
      value: '',
      validation: z.string().regex(/^\d+(\.\d+)?$/, 'Please enter a valid salary'),
      type: 'text',
      label: 'Salary',
      placeholder: 'e.g., 50000',
      required: true,
    },
    role: {
      value: 'staff',
      validation: z.enum(['staff', 'manager', 'admin', 'owner']),
      type: 'select',
      label: 'Role',
      placeholder: 'Select role',
      options: [
        { label: 'Staff', value: 'staff' },
        { label: 'Manager', value: 'manager' },
        { label: 'Admin', value: 'admin' },
        { label: 'Owner', value: 'owner' },
      ],
      required: true,
    },
    hire_date: {
      value: '',
      validation: z.string().min(1, 'Hire date is required'),
      type: 'date',
      label: 'Hire Date',
      placeholder: 'Select date',
      required: true,
    },
    phone: {
      value: '',
      validation: z.string().optional(),
      type: 'text',
      label: 'Phone',
      placeholder: 'Optional',
      required: false,
    },
    address: {
      value: '',
      validation: z.string().min(1, 'Address is required'),
      type: 'text',
      label: 'Address',
      placeholder: 'Enter address',
      required: true,
    },
    skills: {
      value: '',
      validation: z.string().optional(),
      type: 'text',
      label: 'Skills',
      placeholder: 'e.g., JavaScript, React, Node.js',
      required: false,
    },
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary),
      };
      await createMutation.mutateAsync(payload);
      showSnackbar('Member added successfully', 'success');
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showSnackbar('Failed to add member', 'error');
    }
  };

  return (
    <CustomModal title="Add Member" action="Add Member" maxWidth="sm">
      <GeneralForm
        schema={schema}
        onSubmit={handleSubmit}
        buttonText="Add Member"
        sections={{
          'Personal Information': ['name', 'email', 'phone'],
          'Employment Details': ['working', 'salary', 'role', 'hire_date'],
          'Additional Information': ['address', 'skills'],
        }}
      />
    </CustomModal>
  );
};

export default MembersAddModal;
