import { useContext, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import CustomModal from '../../../components/CustomModal/index.jsx';
import GeneralForm from '../../../components/GeneralForm/index.jsx';
import { ModalContext } from '../../../store/ModalContextProvider.jsx';
import { authorizedRequest } from '../../../utils/helpers/http.js';
import { createProjectUrl } from '../../../utils/helpers/apiUrls.js';
import { useNotifications } from '../shared';

const ProjectsAddModal = ({ onSuccess }) => {
  const { modalIsOpen, onCloseModal } = useContext(ModalContext);
  const { show: showNotification } = useNotifications();

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
      showNotification('Project created successfully', { severity: 'success' });
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      showNotification('Failed to create project', { severity: 'error' });
    }
  };

  return (
    <CustomModal
      open={modalIsOpen.open && modalIsOpen.action === 'Add Project'}
      onClose={onCloseModal}
      title="Add Project"
    >
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
