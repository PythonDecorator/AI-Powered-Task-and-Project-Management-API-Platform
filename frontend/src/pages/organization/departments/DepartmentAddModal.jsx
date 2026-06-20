import { useContext, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { membersUrl, createDepartmentUrl } from '../../../utils/helpers/apiUrls.js';
import { useNotifications } from '../shared';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';

const DepartmentAddModal = ({ onSuccess }) => {
  const { modalIsOpen, onCloseModal } = useContext(ModalContext);
  const { show: showNotification } = useNotifications();

  const createMutation = useMutation({
    mutationFn: (data) =>
      authorizedRequest({
        url: createDepartmentUrl,
        method: 'POST',
        payload: data,
      }),
  });

  // Fetch members data using authorizedRequest pattern
  const { data: membersResponse, isPending, isError, error } = useQuery({
    queryKey: [membersUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: membersUrl, signal }),
    staleTime: 10 * 60 * 1000,
  });

  const allMembers = membersResponse?.results || [];

  // Build member options for dropdowns
  const memberOptions = useMemo(() => allMembers.map(m => ({
    label: m.name ? `${m.name} (${m.email})` : m.email,
    value: { id: m.id, email: m.email, name: m.name },
  })), [allMembers]);

  const schema = useMemo(() => ({
    name: {
      value: '',
      validation: z.string().min(1, 'Department name is required').max(100),
      type: 'text',
      label: 'Department Name',
      placeholder: 'e.g., Engineering, Sales',
      required: true,
    },
    head: {
      value: null,
      validation: z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string(),
      }).nullable(),
      type: 'select',
      label: 'Department Head',
      placeholder: 'Select a department head',
      options: memberOptions,
      required: false,
    },
    members: {
      value: null,
      validation: z.array(
        z.object({
          id: z.number(),
          email: z.string().email(),
          name: z.string(),
        })
      ).nullable(),
      type: 'select',
      label: 'Team Members',
      placeholder: 'Select team members',
      options: memberOptions,
      required: false,
    },
  }), [memberOptions]);

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        head: formData.head || null,
        members: formData.members || [],
      };
      await createMutation.mutateAsync(payload);
      showNotification('Department created successfully', { severity: 'success' });
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showNotification('Failed to create department', { severity: 'error' });
    }
  };

  if (isPending) return <Loading />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <CustomModal
      open={modalIsOpen.open && modalIsOpen.action === 'Add Department'}
      onClose={onCloseModal}
      title="Add Department"
    >
      <GeneralForm
        schema={schema}
        onSubmit={handleSubmit}
        buttonText="Create Department"
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

export default DepartmentAddModal;
