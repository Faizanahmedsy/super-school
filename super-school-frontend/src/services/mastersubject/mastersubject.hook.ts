import { useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import { QueryParams } from '../types/params';
import { API } from '../endpoints';

export const useMasterSubjectList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.MASTER_SUBJECT_CRUD.LIST}`,
    params: params,
  });
};

export const useCreateMasterSubject = () => {
  return usePostData({
    url: `${API.MASTER_SUBJECT_CRUD.ADD}`,
    mutationOptions: {
      onError: (error) => {
        console.log('Master Subject addition failed', error);
      },
    },
  });
};

export const useMasterSubjectGetById = (id: any) => {
  return useFetchDetails<any>({
    url: `${API.MASTER_SUBJECT_CRUD.GET_DETAIL_BY_ID}`,
    id: id,
  });
};

export const useUpdateMasterSubject = () => {
  return useUpdateData({
    url: `${API.MASTER_SUBJECT_CRUD.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
      },
      onError: (error) => {
      },
    },
  });
};
