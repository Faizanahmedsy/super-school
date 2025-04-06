import { QueryParams } from '@/services/types/params';
import { ParentPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import { addDoeApi, deleteDoeApi, getDataByIdDoeApi, getDoeListApi, updateDoeApi } from './doe.api';

export const useDoeList = (params: QueryParams) => {
  return useQuery({
    queryKey: ['doe-list', params],
    queryFn: () => getDoeListApi(params),
    staleTime: 1000 * 10,

    retry: 1,
  });
};

export const useCreateDoe = () => {
  return usePostData({
    url: `${API.PARENT.ADD}`,
    mutationOptions: {
      onSuccess: (data) => {
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
      },
    },
  });
};

export const useAddDoeMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: addDoeApi,
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/department-admin/list');
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

export const useAddDoehook = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: addDoeApi,
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/department-admin/list');
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

export const useDoeGetDataById = (id: number) => {
  return useQuery({
    queryKey: ['doe-list-get-byid', id],
    queryFn: () => getDataByIdDoeApi(id),
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
};

export const useUpdateDoe = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: ParentPayload) => updateDoeApi(id, payload),
    onSuccess: (data) => {
      displaySuccess(data?.message || 'Parent deleted successfully');
      navigate('/department-admin/list');
      queryclient.invalidateQueries({ queryKey: ['doe-list'] });
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

export const useDoeDeleteById = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteDoeApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message);
      navigate('/department-admin/list');
      queryclient.invalidateQueries({ queryKey: ['doe-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};
