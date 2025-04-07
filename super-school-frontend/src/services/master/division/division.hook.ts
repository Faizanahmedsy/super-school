import { useDeleteData, usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { useQuery } from '@tanstack/react-query';
import { getDivisionListApi } from './division.api';

export const useDivisionList = (params: QueryParams, enabled?: boolean) => {
  return useQuery({
    queryKey: ['DIVISION-list', params],
    queryFn: () => getDivisionListApi(params),
    staleTime: 1000 * 10,
    retry: 1,
    enabled: enabled,
  });
};

export const useCreateMultiDivision = () => {
  return usePostData({
    url: `${API.DIVISION.MULTI_ADD}`,
    mutationOptions: {
      onSuccess: () => {
      },
      onError: () => {
      },
    },
  });
};

export const useCreateDivision = () => {
  return usePostData({
    url: `${API.DIVISION.ADD}`,
    mutationOptions: {
      onSuccess: () => {
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
      },
    },
  });
};

export const useCreateDivisionSubject = () => {
  return usePostData({
    url: `${API.DIVISION_SUBJECT.CREATE}`,
    mutationOptions: {
      onSuccess: (data) => {
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
      },
    },
  });
};

export const useDeleteDivision = () => {
  return useDeleteData({
    url: `${API.DIVISION.DELETE}`,
    mutationOptions: {
      onSuccess: () => {
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.message);
      },
    },
  });
};
