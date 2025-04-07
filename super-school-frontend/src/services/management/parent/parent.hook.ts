'use client';
import { usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { ParentPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addParentApi, deleteParentApi, getDataByIdParentApi, getParentListApi, updateParentApi } from './parent.api';

// export const useParentList = (params: QueryParams) => {
//   return useQuery({
//     queryKey: ['parent-list', params],
//     queryFn: () => getParentListApi(params),
//     staleTime: 1000 * 10,

//     retry: 1,
//   });
// };

export const useParentList = (params: QueryParams) => {
  return useQuery({
    queryKey: ['parent-list', params],
    queryFn: () => getParentListApi(params),
    staleTime: 1000 * 10,

    retry: 1,
  });
};

export const useCreateParent = () => {
  return usePostData({
    url: `${API.PARENT.ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Parent added successfully', data);
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
        console.log('Parent addition failed', error);
      },
    },
  });
};

export const useAddParentMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: addParentApi,
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/parent/list');
    },
    onError: (error: any) => {
      console.error('onError', error);
      if (error?.status === 409) {
        displayError(error?.response?.data?.message);
      } else {
        displayError('Something went wrong');
      }
    },
  });
};

export const useParentGetDataById = (id: number) => {
  return useQuery({
    queryKey: ['parent-list-get-byid', id],
    queryFn: () => getDataByIdParentApi(id),
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
};

export const useUpdateParent = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: ParentPayload) => updateParentApi(id, payload),
    onSuccess: (data) => {
      displaySuccess(data?.message || 'Parent deleted successfully');
      navigate('/parent/list');
      queryclient.invalidateQueries({ queryKey: ['parent-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      if (error?.status === 409) {
        displayError(error?.response?.data?.message);
      } else {
        displayError('Something went wrong');
      }
    },
  });
};

export const useParentDeleteById = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteParentApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message);
      navigate('/parent/list');
      queryclient.invalidateQueries({ queryKey: ['parent-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};
