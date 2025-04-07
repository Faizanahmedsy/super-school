import { useFetchData } from '@/hooks/api-request';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';

export const useTermList = (params: QueryParams, enabled = true) => {
  return useFetchData<any>({
    url: `${API.TERM.LIST}`,
    params: params,
    enabled: enabled,
  });
};
