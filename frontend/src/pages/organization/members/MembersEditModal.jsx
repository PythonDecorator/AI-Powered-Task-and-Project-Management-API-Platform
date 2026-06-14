import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { updateMemberUrl } from '../../../utils/helpers/apiUrls.js';
import { useSnackbar } from '../../../components/CustomSnackBar';

const MembersEditModal = ({ member, onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      authorizedRequest({
        url: updateMemberUrl(id),
        method: 'PATCH',
        payload: data,
      }),
  });

  const schema = {
    name: {
      value: member?.name || '',
      validation: z.string().min(1, 'Full name is required').max(100),
      type: 'text',
      label: 'Full Name',
      placeholder: 'e.g., John Doe',
      required: true,
    },
    email: {
      value: member?.email || '',
      validation: z.string().email('Invalid email format'),
      type: 'text',
      label: 'Email',
      placeholder: 'john@company.com',
      required: true,
      disabled: true,
    },
    working: {
      value: member?.working || 'Full-time',
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
      value: member?.salary || '',
      validation: z.string().regex(/^\d+(\.\d+)?$/, 'Please enter a valid salary'),
      type: 'text',
      label: 'Salary',
      placeholder: 'e.g., 50000',
      required: true,
    },
    role: {
      value: member?.role || 'staff',
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
      value: member?.hire_date || '',
      validation: z.string().min(1, 'Hire date is required'),
      type: 'date',
      label: 'Hire Date',
      placeholder: 'Select date',
      required: true,
    },
    phone: {
      value: member?.phone || '',
      validation: z.string().optional(),
      type: 'text',
      label: 'Phone',
      placeholder: 'Optional',
      required: false,
    },
    address: {
      value: member?.address || '',
      validation: z.string().min(1, 'Address is required'),
      type: 'text',
      label: 'Address',
      placeholder: 'Enter address',
      required: true,
    },
    skills: {
      value: member?.skills || '',
      validation: z.string().optional(),
      type: 'text',
      label: 'Skills',
      placeholder: 'e.g., JavaScript, React, Node.js',
      required: false,
    },
    is_active: {
      value: member?.is_active || false,
      validation: z.boolean().optional(),
      type: 'checkbox',
      label: 'Active Status',
      required: false,
    },
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary),
      };
      await updateMutation.mutateAsync({ id: member.id, data: payload });
      showSnackbar('Member updated successfully', 'success');
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showSnackbar('Failed to update member', 'error');
    }
  };

  return (
    <CustomModal title="Edit Member" action="Edit Member" maxWidth="sm">
      <GeneralForm
        schema={schema}
        onSubmit={handleSubmit}
        buttonText="Update Member"
        sections={{
          'Personal Information': ['name', 'email', 'phone'],
          'Employment Details': ['working', 'salary', 'role', 'hire_date'],
          'Additional Information': ['address', 'skills'],
          'Status': ['is_active'],
        }}
      />
    </CustomModal>
  );
};

export default MembersEditModal;
