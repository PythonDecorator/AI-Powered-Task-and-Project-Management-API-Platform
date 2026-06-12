import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '../../utils/helpers/http.js';
import { getCurrentUserUrl } from '../../utils/helpers/apiUrls.js';

/**
 * Hook for getting current authenticated user
 * Uses authorizedRequest (needs token)
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: [getCurrentUserUrl],
    queryFn: ({ signal }) =>
      authorizedRequest({
        url: getCurrentUserUrl,
        signal,
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
