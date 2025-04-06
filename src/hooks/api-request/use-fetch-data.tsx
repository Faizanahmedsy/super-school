import { buildQueryString } from '@/lib/common-functions';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// NOTE: USE THIS CUSTOM HOOK FOR SIMPLE API CALLS WHEN YOU WANT COMPLEX LOGIN PLEASE USE USE QUERY HOOK

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
const useFetchData = <TData = unknown, TParams = Record<string, any>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true,
}: {
  url: string;
  params?: TParams;
  queryOptions?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>;
  enabled?: boolean;
}) => {
  return useQuery<TData, Error>({
    queryKey: [url, params], // Default queryKey includes the URL and params for caching
    queryFn: async () => {
      const queryString = buildQueryString(params as QueryParams);
      const response = await superAxios.get(`${url}${queryString}`);
      if (response.data?.statusCode == 200) {
        return response?.data?.data;
      }
    },
    retry: 1, // Retry failed requests once
    refetchOnWindowFocus: false,
    enabled: enabled, // Enable the query by
    staleTime: 0,
    ...queryOptions, // Spread additional options
  });
};

export default useFetchData;
