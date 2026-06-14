import { useContext, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { membersUrl, updateDepartmentUrl } from '../../../utils/helpers/apiUrls.js';
import { useSnackbar } from '../../../components/CustomSnackBar';
import Loading from '../../../components/Loading/index.jsx';
import ErrorMessage from '../../../components/ErrorMessage/index.jsx';

const DepartmentEditModal = ({ department, onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      authorizedRequest({
        url: updateDepartmentUrl(id),
        method: 'PATCH',
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
      }).nullable(),
      type: 'select',
      label: 'Department Head',
      placeholder: 'Select a department head',
      options: memberOptions,
      required: false,
    },
    members: {
      value: department?.members
        ? department.members.map(m => ({ id: m.id, email: m.email, name: m.name }))
        : null,
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
  }), [department, memberOptions]);

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        head: formData.head || null,
        members: formData.members || [],
      };
      await updateMutation.mutateAsync({ id: department.id, data: payload });
      showSnackbar('Department updated successfully', 'success');
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showSnackbar('Failed to update department', 'error');
    }
  };

  if (isPending) return <Loading />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <CustomModal title="Edit Department" action="Edit Department" maxWidth="sm">
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
