import { useFetchData, usePostData } from '@/hooks/api-request';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { useMutation } from '@tanstack/react-query';

export const useFetchSetupStatus = () => {
  return useFetchData<any>({
    url: `${API.SETUP.GET_STATUS}`,
  });
};

export const useGradeSetup = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await superAxios.patch(`${API.SETUP.GRADE_SETUP}`, payload);
      if (response.data?.error === false) {
        displaySuccess(response.data?.message);
        return response.data?.data;
      }
      throw new Error(response.data?.message || 'Failed to update resource');
    },
  });
};

export const useDivisionSetup = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await superAxios.patch(`${API.SETUP.DIVISION_SETUP}`, payload);
      if (response.data?.error === false) {
        displaySuccess(response.data?.message);
        return response.data?.data;
      }
      throw new Error(response.data?.message || 'Failed to update resource');
    },
  });
};

export const useBatchSetup = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await superAxios.patch(`${API.SETUP.BATCH_SETUP}`, payload);
      if (response.data?.error === false) {
        displaySuccess(response.data?.message);
        return response.data?.data;
      }
      throw new Error(response.data?.message || 'Failed to update resource');
    },
  });
};

export const useUpdateSetupStatus = () => {
  return usePostData({
    url: `${API.SETUP.UPDATE_STATUS}`,
  });
};
