import { displaySuccess } from '@/lib/helpers/successHelpers';
import superAxios from '@/services/instance';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

/**
 * Custom hook to add new data using TanStack Query and Axios.
 *
 * @template TData The type of data returned after adding the new resource
 * @template TPayload The type of payload to be sent for the new resource
 * @param {Object} options - The options for the mutation
 * @param {string} options.url - The base API endpoint for adding new data
 * @param {UseMutationOptions<TData, Error, TPayload>} [options.mutationOptions] - Additional options for useMutation
 * @returns The result of useMutation (mutate, mutateAsync, isLoading, etc.)
 */
const usePostData = <TData = unknown, TPayload = unknown>({
  url,
  mutationOptions = {},
}: {
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, TPayload>;
}) => {
  return useMutation<TData, Error, TPayload>({
    mutationFn: async (payload) => {
      const response = await superAxios.post(url, payload);
      if (response.data?.statusCode === 200 || response.status === 201) {
        if (url != 'auth/re-login') {
          displaySuccess(response?.data?.message);
        }
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to add new password');
    },
    onError: (error: any) => {
      console.error('usePostData error', error);
      // displayError(error.response?.data?.message);
    },
    ...mutationOptions,
    retry: false,
  });
};

export default usePostData;
