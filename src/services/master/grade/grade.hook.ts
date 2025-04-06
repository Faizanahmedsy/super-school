import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';

export const useDeleteGrade = () => {
  return useDeleteData({
    url: `${API.GRADE.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Grade deleted successfully', data);
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);

        console.log('useDeleteGrade failed', error);
      },
    },
  });
};

export const useGradeDetails = (id: number) => {
  return useFetchDetails({
    url: API.GRADE.DETAILS,
    id,
    queryOptions: {},
  });
};

export const useGradeList = (params: QueryParams, enabled?: boolean) => {
  return useFetchData<any>({
    url: `${API.GRADE.LIST}`,
    params: params,
    enabled: enabled,
  });
};

export const useCreateGrade = () => {
  return usePostData({
    url: `${API.GRADE.ADD}`,
    mutationOptions: {
      onSuccess: () => {
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
      },
    },
  });
};

export const useCreateMultiGrade = () => {
  return usePostData<any>({
    url: `${API.GRADE.MULTI_ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Grade added successfully', data);
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);

        console.log('Grade addition failed', error);
      },
    },
  });
};

export const useUpdateGrade = () => {
  return useUpdateData({
    url: `${API.GRADE.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Grade updated successfully', data);
      },
      onError: (error) => {
        console.log('Grade update failed', error);
      },
    },
  });
};
