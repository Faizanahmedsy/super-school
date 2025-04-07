import { API } from '@/services/endpoints';

import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { PermissionApiResponse, PermissionListQuery } from './Permission.types';

export const usePermissionList = (params: PermissionListQuery) => {
  return useFetchData<PermissionApiResponse>({
    url: `${API.PERMISSION.LIST}`,
    params: params,
  });
};

export const useCreatePermission = () => {
  return usePostData({
    url: `${API.PERMISSION.ADD}`,
    mutationOptions: {
      onSuccess: () => {
        displaySuccess('Permission added successfully');
      },
      onError: (error) => {
        console.log('Permission addition failed', error);
      },
    },
  });
};

export const useUpdatePermission = () => {
  return useUpdateData({
    url: `${API.PERMISSION.UPDATE}`,
    mutationOptions: {
      onSuccess: () => {
        displaySuccess('Permission updated successfully');
      },
      onError: (error) => {
        displayError(error.message);
      },
    },
  });
};

export const useDeletePermission = () => {
  return useDeleteData({
    url: `${API.PERMISSION.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Permission deleted successfully', data);
      },
      onError: (error) => {
        console.log('Permission deletion failed', error);
      },
    },
  });
};

export const usePermissionDetails = (id: number) => {
  return useFetchDetails({
    url: API.PERMISSION.DETAILS,
    id,
    queryOptions: {},
  });
};
