import djangoAxios from '@/services/djangoInstance';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

/**
 * Custom hook to delete a resource using TanStack Query and Axios.
 *
 * @template TData The type of data returned after deletion
 * @param {Object} options - The options for the mutation
 * @param {string} options.url - The base API endpoint for deletion
 * @param {UseMutationOptions<TData, Error, number>} [options.mutationOptions] - Additional options for useMutation
 * @returns The result of useMutation (mutate, mutateAsync, isLoading, etc.)
 */
const useDeleteDataDjango = <TData = unknown,>({
  url,
  mutationOptions = {},
}: {
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, number>;
}) => {
  return useMutation<TData, Error, number>({
    mutationFn: async (id: number) => {
      const response = await djangoAxios.delete(`${url}${id}/`);
      return response.data;
    },
    ...mutationOptions,
  });
};

export default useDeleteDataDjango;
