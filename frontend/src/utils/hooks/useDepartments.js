import { useMutation, useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '../helpers/http.js';
import {
  departmentsUrl,
  createDepartmentUrl,
  updateDepartmentUrl,
  deleteDepartmentUrl,
} from '../helpers/apiUrls.js';

export const useDepartments = () => {
  return useQuery({
    queryKey: [departmentsUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateDepartment = () => {
  return useMutation({
    mutationFn: (data) =>
      authorizedRequest({
        url: createDepartmentUrl,
        method: 'POST',
        payload: data,
      }),
  });
};

export const useUpdateDepartment = () => {
  return useMutation({
    mutationFn: ({ id, data }) =>
      authorizedRequest({
        url: updateDepartmentUrl(id),
        method: 'PATCH',
        payload: data,
      }),
  });
};

export const useDeleteDepartment = () => {
  return useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteDepartmentUrl(id),
        method: 'DELETE',
      }),
  });
};
