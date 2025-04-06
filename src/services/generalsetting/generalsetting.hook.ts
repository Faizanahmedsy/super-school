import { useFetchData, usePostData } from '@/hooks/api-request';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useMutation } from '@tanstack/react-query';
import { API } from '../endpoints';
import superAxios from '../instance';

export const useGetGeneralDetails = () => {
  return useFetchData<any>({
    url: `${API.GENERAL_SETTING.DETAIL}`,
    enabled: true,
  });
};

export const useCreateGeneralSetting = () => {
  return usePostData({
    url: `${API.GENERAL_SETTING.ADD}`,
    mutationOptions: {
      onError: (error) => {
        console.log('general setting addition failed', error);
      },
    },
  });
};


export const useDeleteLogo = () => {
  return useMutation<any, any, any>({
    mutationFn: async (payload) => {
      const response = await superAxios.delete(`${API.GENERAL_SETTING.REMOVE_LOGO}`, {
        data: payload,
      });
      if (response?.statusText === 'OK') {
        displaySuccess(response?.data?.message);
        return response.data?.data;
      }
      throw new Error(response.data?.message || 'Failed to delete resource');
    },
  });
};
