import { useFetchData } from '@/hooks/api-request';
import { QueryParams } from '../types/params';
import { API } from '../endpoints';

export const useAuditLogList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.AUDIT_LOG.LIST}`,
    params: params,
  });
};
