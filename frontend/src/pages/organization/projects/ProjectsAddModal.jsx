import { useContext, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { createProjectUrl } from '../../../utils/helpers/apiUrls.js';
import { useSnackbar } from '../../../components/CustomSnackBar';

const ProjectsAddModal = ({ onSuccess }) => {
  const { onCloseModal } = useContext(ModalContext);
  const { showSnackbar } = useSnackbar();

  const createMutation = useMutation({
    mutationFn: (data) =>
      authorizedRequest({
        url: createProjectUrl,
        method: 'POST',
        payload: data,
      }),
  });

  const schema = useMemo(() => ({
    name: {
      value: '',
      validation: z.string().min(1, 'Project name is required').max(100),
      type: 'text',
      label: 'Project Name',
      placeholder: 'e.g., Website Redesign',
      required: true,
    },
    description: {
      value: '',
      validation: z.string().max(500).optional(),
      type: 'text',
      label: 'Description',
      placeholder: 'Project description',
      required: false,
    },
    start_date: {
      value: '',
      validation: z.string().min(1, 'Start date is required'),
      type: 'date',
      label: 'Start Date',
      required: true,
    },
    status: {
      value: 'active',
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
  }), []);

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        start_date: formData.start_date,
        status: formData.status || 'active',
      };
      await createMutation.mutateAsync(payload);
      showSnackbar('Project created successfully', 'success');
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showSnackbar('Failed to create project', 'error');
    }
  };

  return (
    <CustomModal title="Add Project" action="Add Project" maxWidth="sm">
      <GeneralForm
        schema={schema}
        onSubmit={handleSubmit}
        buttonText="Create Project"
        sections={{
          'Project Details': ['name', 'description', 'start_date', 'status'],
        }}
      />
    </CustomModal>
  );
};

export default ProjectsAddModal;
