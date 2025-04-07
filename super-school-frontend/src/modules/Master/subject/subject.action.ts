import { useDeleteData, useFetchData, useFetchDetails, usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';

export const useSubjectList = (params: QueryParams, enabled?: boolean) => {
  return useFetchData<any>({
    url: `${API.SUBJECT.LIST}`,
    params: params,
    enabled: enabled,
  });
};

export const useCreateSubject = () => {
  return usePostData({
    url: `${API.SUBJECT.ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Subject added successfully', data);
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
        console.log('Subject addition failed', error);
      },
    },
  });
};

export const useSubjectDetails = (id: number) => {
  return useFetchDetails<any>({
    url: `${API.SUBJECT.DETAILS}`,
    id: id,
  });
};

export const useDeleteSubject = () => {
  return useDeleteData({
    url: `${API.SUBJECT.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Subject deleted successfully', data);
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
        console.log('Subject deletion failed', error);
      },
    },
  });
};

export const useDivisionSubjectList = (params: QueryParams, enabled?: boolean) => {
  return useFetchData<any>({
    url: `${API.DIVISION_SUBJECT.LIST}`,
    params: params,
    enabled: enabled,
  });
};

export const useDeleteDivisonSubject = () => {
  return useDeleteData({
    url: `${API.DIVISION_SUBJECT.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Subject deleted successfully', data);
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
        console.log('Subject deletion failed', error);
      },
    },
  });
};

export const useMasterSubjectList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.MASTER_SUBJECT.LIST}`,
    params: params,
  });
};

export const useCreateMultiSubject = () => {
  return usePostData({
    url: `${API.SUBJECT.MULTI_ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Subject added successfully', data);
      },
    },
  });
};


export const useClasswiseLearnerTeacherList = (params: QueryParams, enabled?: boolean) => {
  return useFetchData<any>({
    url: `${API.DIVISION_SUBJECT.LEARNER_TEACHER_LIST}`,
    params: params,
    enabled: enabled,
  });
};