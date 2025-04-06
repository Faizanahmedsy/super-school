import djangoAxios from '@/services/djangoInstance';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import useHandleSuperAdminParams from '../api-params/use-handle-super-admin-params';
import { buildQueryString } from '@/lib/common-functions';
import { QueryParams } from '@/services/types/params';

/**
 * Custom hook to fetch the details of a specific resource using TanStack Query and Axios.
 *
 * @template TData The type of data returned by the API
 * @param {Object} options - The options for the query
 * @param {string} options.url - The base API endpoint
 * @param {number} options.id - The ID of the resource to fetch
 * @param {UseQueryOptions<TData, Error>} [options.queryOptions] - Additional options for useQuery
 * @returns The result of useQuery (data, error, isLoading, etc.)
 */
const useFetchDetailsDjango = <TData = unknown,>({
  url,
  id,
  queryOptions = {},
}: {
  url: string;
  id: number | string | undefined;
  queryOptions?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>;
}) => {
  const updatedParams = useHandleSuperAdminParams({} as QueryParams);

  const queryString = buildQueryString(updatedParams as QueryParams);

  return useQuery<TData, Error>({
    queryKey: [url, id, updatedParams], // Default queryKey includes the URL and ID for caching
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required to fetch details.');
      }
      const response = await djangoAxios.get(`${url}${id}${queryString}`);
      if (response.data?.statusCode === 200) {
        return response.data?.data;
      }
      throw new Error(response.data?.message || 'Failed to fetch details.');
    },
    enabled: !!id, // Only run the query if the ID is provided
    retry: false, // Disable retrying failed requests
    ...queryOptions, // Spread additional options
  });
};

export default useFetchDetailsDjango;
