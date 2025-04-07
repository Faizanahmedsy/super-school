import { displayError } from '@/lib/helpers/errorHelpers';
import djangoAxios from '@/services/djangoInstance';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import useHandleSuperAdminParams from '../api-params/use-handle-super-admin-params';
import { QueryParams } from '@/services/types/params';
import { buildQueryString } from '@/lib/common-functions';

/**
 * Custom hook to post data with optional payload using TanStack Query and Axios.
 *
 * @template TData The type of data returned by the API
 * @template TPayload The type of payload to be sent in the POST request
 * @param {Object} options - The options for the mutation
 * @param {string} options.url - The base API endpoint
 * @param {TPayload} [options.payload={}] - The payload for the request
 * @param {UseMutationOptions<TData, Error, TPayload>} [options.mutationOptions] - Additional options for useMutation
 * @returns The result of useMutation (data, error, isLoading, etc.)
 */
const usePostDataDjango = <TData = unknown, TPayload = Record<string, any>>({
  url,
  payload = {} as TPayload,
  mutationOptions = {},
}: {
  url: string;
  payload?: TPayload;
  mutationOptions?: Omit<UseMutationOptions<TData, Error, TPayload>, 'mutationFn'>;
}) => {
  const updatedParams = useHandleSuperAdminParams({} as QueryParams);
  const queryString = buildQueryString(updatedParams as QueryParams);

  return useMutation<TData, Error, TPayload>({
    mutationFn: async (data: TPayload) => {
      const response = await djangoAxios.post(`${url}${queryString}`, data || payload);
      if (response) {
        return response.data;
      }
      throw new Error('Failed to post data');
    },
    onError: (err: any) => {
      if (err?.response?.data?.error || err?.response?.data) {
        displayError(err?.response?.data?.error || err?.response?.data);
      } else if (err?.response?.data?.detail) {
        displayError(err?.response?.data?.detail);
      } else {
        displayError('An error occurred while submitting the form.');
      }
    },
    retry: false,
    ...mutationOptions, // Spread additional options
  });
};

export default usePostDataDjango;
