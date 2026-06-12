import { useMutation, useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '../helpers/http.js';
import { membersUrl, createMemberUrl, updateMemberUrl, deleteMemberUrl } from '../helpers/apiUrls.js';

export const useMembers = () => {
  return useQuery({
    queryKey: [membersUrl],
    queryFn: ({ signal }) => authorizedRequest({ url: membersUrl, signal }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateMember = () => {
  return useMutation({
    mutationFn: (data) =>
      authorizedRequest({
        url: createMemberUrl,
        method: 'POST',
        payload: data,
      }),
  });
};

export const useUpdateMember = () => {
  return useMutation({
    mutationFn: ({ id, data }) =>
      authorizedRequest({
        url: updateMemberUrl(id),
        method: 'PATCH',
        payload: data,
      }),
  });
};

export const useDeleteMember = () => {
  return useMutation({
    mutationFn: (id) =>
      authorizedRequest({
        url: deleteMemberUrl(id),
        method: 'DELETE',
      }),
  });
};
