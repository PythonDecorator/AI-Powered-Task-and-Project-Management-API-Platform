import { useContext, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { updateProjectUrl } from '../../../utils/helpers/apiUrls.js';
import { useSnackbar } from '../../../components/CustomSnackBar';

const ProjectsEditModal = ({ project, onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      authorizedRequest({
        url: updateProjectUrl(id),
        method: 'PATCH',
        payload: data,
      }),
  });

  const schema = useMemo(() => ({
    name: {
      value: project?.name || '',
      validation: z.string().min(1, 'Project name is required').max(100),
      type: 'text',
      label: 'Project Name',
      placeholder: 'e.g., Website Redesign',
      required: true,
    },
    description: {
      value: project?.description || '',
      validation: z.string().max(500).optional(),
      type: 'text',
      label: 'Description',
      placeholder: 'Project description',
      required: false,
    },
    start_date: {
      value: project?.start_date || '',
      validation: z.string().min(1, 'Start date is required'),
      type: 'date',
      label: 'Start Date',
      required: true,
    },
    status: {
      value: project?.status || 'active',
      validation: z.string().min(1, 'Status is required'),
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Completed', value: 'completed' },
        { label: 'On Hold', value: 'on_hold' },
      ],
      required: true,
    },
  }), [project]);

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        start_date: formData.start_date,
        status: formData.status || 'active',
      };
      await updateMutation.mutateAsync({ id: project.id, data: payload });
      showSnackbar('Project updated successfully', 'success');
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showSnackbar('Failed to update project', 'error');
    }
  };

  return (
    <CustomModal title="Edit Project" action="Edit Project" maxWidth="sm">
      <GeneralForm
        schema={schema}
        onSubmit={handleSubmit}
        buttonText="Update Project"
        sections={{
          'Project Details': ['name', 'description', 'start_date', 'status'],
        }}
      />
    </CustomModal>
  );
};

export default ProjectsEditModal;
