import { QueryParams } from '@/services/types/params';
import { ParentPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';

import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { addEventApi, deleteEventApi, getDataByIdEventApi, getEventListApi, updateEventApi } from './calendar.api';


export const useEventList = (params: QueryParams) => {
  return useQuery({
    queryKey: ['event-list', params],
    queryFn: () => getEventListApi(params),
    staleTime: 1000 * 10,
    retry: 1,
  });
};

export const useAddEventhook = () => {
  return useMutation({
    mutationFn: addEventApi,
    onSuccess: (data) => {
      displaySuccess(data?.message);
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

export const useEventGetDataById = (id: number) => {
  return useQuery({
    queryKey: ['event-list-get-byid', id],
    queryFn: () => getDataByIdEventApi(id),
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
};

export const useUpdateEvent = (id: number, queryclient: any) => {
  return useMutation({
    mutationFn: (payload: ParentPayload) => updateEventApi(id, payload),
    onSuccess: (data) => {
      displaySuccess(data?.message);
      queryclient.invalidateQueries({ queryKey: ['event-list'] });
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

export const useEventDeleteById = (id: number, queryclient: any) => {
  return useMutation({
    mutationFn: () => deleteEventApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message);
      queryclient.invalidateQueries({ queryKey: ['event-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};
