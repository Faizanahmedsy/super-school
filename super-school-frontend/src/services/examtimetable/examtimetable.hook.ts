import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import { QueryParams } from '../types/params';
import { API } from '../endpoints';

export const useExamtimetableList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.EXAME_TIMETABLE.LIST}`,
    params: params,
  });
};

export const useCreateExamtimetable = () => {
  return usePostData({
    url: `${API.EXAME_TIMETABLE.ADD}`,
    mutationOptions: {
      onError: (error) => {
        console.log('Examtimetable addition failed', error);
      },
    },
  });
};

export const useExamtimetableDetailsGetById = (id: any) => {
  return useFetchDetails<any>({
    url: `${API.EXAME_TIMETABLE.GET_DETAIL_BY_ID}`,
    id: id,
  });
};

export const useUpdateExamtimetable = () => {
  return useUpdateData({
    url: `${API.EXAME_TIMETABLE.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Examtimetable updated successfully', data);
      },
      onError: (error) => {
        console.log('Examtimetable update failed', error);
      },
    },
  });
};

export const useDeleteExamtimetable = () => {
  return useDeleteData({
    url: `${API.EXAME_TIMETABLE.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Examtimetable updated successfully', data);
      },
      onError: (error) => {
        console.log('Examtimetable update failed', error);
      },
    },
  });
};
