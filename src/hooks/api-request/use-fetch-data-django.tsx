import { buildQueryString } from '@/lib/common-functions';
import djangoAxios from '@/services/djangoInstance';
import { QueryParams } from '@/services/types/params';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import useHandleSuperAdminParams from '../api-params/use-handle-super-admin-params';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';

/**
 * Custom hook to fetch data with query params using TanStack Query and Axios.
 *
 * @template TData The type of data returned by the API
 * @template TParams The type of query parameters
 * @param {Object} options - The options for the query
 * @param {string} options.url - The base API endpoint
 * @param {TParams} [options.params={}] - The query parameters for the request
 * @param {UseQueryOptions<TData, Error>} [options.queryOptions] - Additional options for useQuery
 * @returns The result of useQuery (data, error, isLoading, etc.)
 */
const useFetchDataDjango = <TData = unknown, TParams = Record<string, any>>({
  enabled,
  url,
  params = {} as TParams,
  queryOptions = {},
}: {
  enabled?: boolean;
  url: string;
  params?: TParams;
  queryOptions?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>;
}) => {
  let superAdminParams = useHandleSuperAdminParams(params as QueryParams);
  // let parentParams = useHandleParentParams(params as QueryParams);

  const userRole = useGlobalState((state) => state.user?.role_name);
  let updatedParams = params || {};

  if (userRole == ROLE_NAME.SUPER_ADMIN || userRole == ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    updatedParams = superAdminParams;
  } else if (userRole == ROLE_NAME.PARENT) {
    // updatedParams = parentParams;
  }

  const queryString = buildQueryString(updatedParams as QueryParams);

  return useQuery<TData, Error>({
    queryKey: [url, updatedParams], // Default queryKey includes the URL and params for caching
    queryFn: async () => {
      try {
        const response = await djangoAxios.get(`${url}${queryString}`);
        if (response.status === 200) {
          return response.data;
        }
        throw new Error(`Unexpected response status: ${response.status}`);
      } catch (error: any) {
        console.error('useFetchDataDjango error:', error);
        throw error; // Propagate error to useQuery
      }
    },
    retry: 1, // Retry failed requests once
    refetchOnWindowFocus: false,
    enabled: enabled, // Enable the query by
    staleTime: 0,
    ...queryOptions, // Spread additional options
  });
};

export default useFetchDataDjango;
