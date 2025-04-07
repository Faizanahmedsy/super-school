import { useFetchData } from '@/hooks/api-request';
import { useMutation } from '@tanstack/react-query';
import { API } from '../endpoints';
import superAxios from '../instance';
import { QueryParams } from '../types/params';

export const useNotificationList = (
  params: QueryParams
): {
  refetch(): unknown;
  data: any;
  isLoading: boolean;
} => {
  return useFetchData({
    url: API.NOTIFICATION.LIST,
    params: params,
  });
};


export const useUnReadNotificationList = (
  params: QueryParams
): {
  refetch(): unknown;
  data: any;
  isLoading: boolean;
} => {
  return useFetchData({
    url: API.NOTIFICATION.UNREAD_COUNT,
    params: params,
  });
};

export const useNotificationReadAll = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await superAxios.put(`${API.NOTIFICATION.READ_ALL}`);
      if (response.data?.error === false) {
        return response.data?.data;
      }
      throw new Error(response.data?.message || 'Failed to update resource');
    },
  });
};
