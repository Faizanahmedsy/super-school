import { useFetchData, useUpdateData } from '@/hooks/api-request';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';

export const useModulePermissionList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.ROLE_BASE_PERMISSION.LIST}`,
    params: params,
  });
};

export const useUpdateModulePermission = () => {
  return useUpdateData({
    url: `${API.ROLE_BASE_PERMISSION.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
      },
      onError: (error) => {
      },
    },
  });
};
