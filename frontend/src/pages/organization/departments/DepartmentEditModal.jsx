import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { useUpdateDepartment } from '../../../utils/hooks/useDepartments.js';
import { getMembers } from '../../../utils/apis.js';

const DepartmentEditModal = ({ department, onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const updateMutation = useUpdateDepartment();

  // Fetch members with proper caching
  const { data: membersResponse } = useQuery({
    queryKey: ['/member/'],
    queryFn: getMembers,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const allMembers = membersResponse?.data?.results || [];

  // Build member options for dropdowns
  const memberOptions = allMembers.map(m => ({
    label: m.name ? `${m.name} (${m.email})` : m.email,
    value: { id: m.id, email: m.email, name: m.name },
  }));

  const schema = {
    name: {
      value: department?.name || '',
      validation: z.string().min(1, 'Department name is required').max(100),
      type: 'text',
      label: 'Department Name',
      placeholder: 'e.g., Engineering, Sales',
      required: true,
    },
    head: {
      value: department?.head
        ? { id: department.head.id, email: department.head.email, name: department.head.name }
        : null,
      validation: z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string(),
      }).nullable().optional(),
      type: 'select',
      label: 'Department Head',
      placeholder: 'Select a department head',
      options: memberOptions,
      required: false,
    },
    members: {
      value: department?.members
        ? department.members.map(m => ({ id: m.id, email: m.email, name: m.name }))
        : [],
      validation: z.array(
        z.object({
          id: z.number(),
          email: z.string().email(),
          name: z.string(),
        })
      ).optional(),
      type: 'select',
      label: 'Team Members',
      placeholder: 'Select team members',
      options: memberOptions,
      required: false,
    },
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        head: formData.head?.id || null,
        members: formData.members?.map(m => m.id) || [],
      };
      await updateMutation.mutateAsync({ id: department.id, data: payload });
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      console.error('Failed to update department:', err);
    }
  };

  return (
    <CustomModal title="Edit Department" maxWidth="sm">
      <GeneralForm
        schema={schema}
        onSubmit={handleSubmit}
        buttonText="Update Department"
        fieldProps={{
          head: { multiple: false },
          members: { multiple: true },
        }}
        sections={{
          'Department Details': ['name', 'head', 'members'],
        }}
      />
    </CustomModal>
  );
};

export default DepartmentEditModal;
