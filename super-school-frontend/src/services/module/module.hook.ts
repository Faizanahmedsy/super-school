import { useFetchData } from '@/hooks/api-request';
import { API } from '../endpoints';
import { QueryParams } from '../types/params';

export const useModuleList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.MODULE.LIST}`,
    params: params,
  });
};
