import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import { SettingsApiResponse } from '../types/settings.types';

export const useSettingsList = (params: QueryParams) => {
  return useFetchData<SettingsApiResponse>({
    url: `${API.SETTINGS.LIST}`,
    params: params,
  });
};

export const useCreateSettings = () => {
  return usePostData({
    url: `${API.SETTINGS.ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Settings added successfully', data);
      },
      onError: (error) => {
        console.log('Settings addition failed', error);
      },
    },
  });
};

export const useUpdateSettings = () => {
  return useUpdateData({
    url: `${API.SETTINGS.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Settings updated successfully', data);
      },
      onError: (error) => {
        console.log('Settings update failed', error);
      },
    },
  });
};

export const useDeleteSettings = () => {
  return useDeleteData({
    url: `${API.SETTINGS.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Settings deleted successfully', data);
      },
      onError: (error) => {
        console.log('Settings deletion failed', error);
      },
    },
  });
};

export const useSettingsDetails = (id: number) => {
  return useFetchDetails({
    url: API.SETTINGS.DETAILS,
    id,
    queryOptions: {},
  });
};
