import { API } from '@/services/endpoints';

import { QueryParams } from '@/services/types/params';
import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import { UserroleApiResponse } from './Userrole.types';

export const useUserroleList = (params: QueryParams) => {
  return useFetchData<UserroleApiResponse>({
    url: `${API.USER_ROLE.LIST}`,
    params: params,
  });
};

export const useCreateUserrole = () => {
  return usePostData({
    url: `${API.USER_ROLE.ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Userrole added successfully', data);
      },
      onError: (error) => {
        console.log('Userrole addition failed', error);
      },
    },
  });
};

export const useUpdateUserrole = () => {
  return useUpdateData({
    url: `${API.USER_ROLE.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Userrole updated successfully', data);
      },
      onError: (error) => {
        console.log('Userrole update failed', error);
      },
    },
  });
};

export const useDeleteUserrole = () => {
  return useDeleteData({
    url: `${API.USER_ROLE.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Userrole deleted successfully', data);
      },
      onError: (error) => {
        console.log('Userrole deletion failed', error);
      },
    },
  });
};

export const useUserroleDetails = (id: number) => {
  return useFetchDetails({
    url: API.USER_ROLE.DETAILS,
    id,
    queryOptions: {},
  });
};
