import { usePostData } from '@/hooks/api-request';
import useUpdateData from '@/hooks/api-request/use-update-data';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { EditAdminPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addAdminApi, AdminDeleteByIdApi, getAdminListApi, GetDataByIdAdminApi, UpdateAdminApi } from './admin.api';

export const useAdminList = (params: QueryParams = { page: 1, limit: 10, sort: 'desc' }) => {
  return useQuery({
    queryKey: ['admin-list', params],
    queryFn: () => getAdminListApi(params),
    staleTime: 1000 * 10,
  });
};

// This need to be removed as this is replaced with useCreateAdmin

export const useAddAdminMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: addAdminApi,
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/admin/list');
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

export const useCreateAdmin = () => {
  return usePostData({
    url: `${API.ADMIN.ADD}`,
    mutationOptions: {
      onSuccess: (data: { message: string; data: { id: number; name: string } }) => {
        console.log('Admin added successfully', data);
        // displaySuccess(data?.message);
      },
      onError: (error: unknown) => {
        console.log('Admin addition failed', error);
      },
    },
  });
};

export const useUpdateAdminNew = () => {
  return useUpdateData({
    url: `${API.ADMIN.UPDATE}`,
    mutationOptions: {
      onSuccess: (data: unknown) => {
        console.log('Admin updated successfully', data);
      },
      onError: (error: unknown) => {
        console.log('Admin update failed', error);
      },
    },
  });
};

export const useAdminGetDataById = (id: number) => {
  return useQuery({
    queryKey: ['admin-list-get-byids', id],
    queryFn: () => GetDataByIdAdminApi(id),
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
};

//This need to be removed as this is replaced with useUpdateAdminNew

export const useUpdateAdmin = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: EditAdminPayload) => UpdateAdminApi(id, payload),
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/admin/list');
      queryclient.invalidateQueries({ queryKey: ['admin-list'] });
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

export const useAdminDeleteById = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => AdminDeleteByIdApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message || 'Admin deleted successfully');
      navigate('/admin/list');
      queryclient.invalidateQueries({ queryKey: ['admin-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};
