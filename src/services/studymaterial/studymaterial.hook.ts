import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';

export const useStudymaterialList = (params: QueryParams, enabled: boolean = true) => {
  return useFetchData<any>({
    url: `${API.STUDY_MATERIAL.LIST}`,
    params: params,
    enabled: Boolean(enabled),
  });
};

export const useCreateStudymaterial = () => {
  return usePostData({
    url: `${API.STUDY_MATERIAL.ADD}`,
    mutationOptions: {
      onSuccess: (data: any) => {
      },
      onError: (error) => {
      },
    },
  });
};

export const useUpdateStudymaterial = () => {
  return useUpdateData({
    url: `${API.STUDY_MATERIAL.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Study Material updated successfully', data);
      },
      onError: (error) => {
        console.log('Study Material update failed', error);
      },
    },
  });
};

export const useDeleteStudymaterial = () => {
  return useDeleteData({
    url: `${API.STUDY_MATERIAL.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
      },
      onError: (error) => {
      },
    },
  });
};

export const useStudymaterialDetails = (id: any) => {
  return useFetchDetails({
    url: API.STUDY_MATERIAL.GET_DATA_BY_ID,
    id,
  });
};
