import djangoAxios from '@/services/djangoInstance';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import useHandleSuperAdminParams from '../api-params/use-handle-super-admin-params';
import { buildQueryString } from '@/lib/common-functions';
import { QueryParams } from '@/services/types/params';

/**
 * Custom hook to update a resource using TanStack Query and Axios.
 *
 * @template TData The type of data returned after the update
 * @template TPayload The type of payload to be sent for the update
 * @param {Object} options - The options for the mutation
 * @param {string} options.url - The base API endpoint for updating
 * @param {UseMutationOptions<TData, Error, { id: number; payload: TPayload }>} [options.mutationOptions] - Additional options for useMutation
 * @returns The result of useMutation (mutate, mutateAsync, isLoading, etc.)
 */
const useUpdateDataDjango = <TData = unknown, TPayload = unknown>({
  url,
  mutationOptions = {},
  method = 'patch',
}: {
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, { id: number; payload: TPayload }>;
  method?: 'put' | 'patch';
}) => {
  const updatedParams = useHandleSuperAdminParams({} as QueryParams);

  const queryString = buildQueryString(updatedParams as QueryParams);

  return useMutation<TData, Error, { id: number; payload: TPayload }>({
    mutationFn: async ({ id, payload }) => {
      let response;
      if (method === 'put') {
        response = await djangoAxios.put(`${url}${id}/${queryString}`, payload);
      } else {
        response = await djangoAxios.patch(`${url}${id}/${queryString}`, payload);
      }
      if (response.status == 200 || response.status == 201) {
        return response?.data;
      }
      //   if (response.data?.error === false) {
      //     return response.data?.
      //   }
      //   throw new Error(response.data?.message || "Failed to update resource");
    },
    ...mutationOptions,
  });
};

export default useUpdateDataDjango;
