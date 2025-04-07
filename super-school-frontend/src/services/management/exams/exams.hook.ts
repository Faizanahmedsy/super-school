import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { QueryParams } from '@/services/types/params';
import { EditExamPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addExamApi, ExamDeleteByIdApi, GetDataByIdExamApi, getExamsListApi, UpdateExamApi } from './exams.api';

export const useExamsList = (params: QueryParams = { page: 1, limit: 10, sort: 'asc' }) => {
  return useQuery({
    queryKey: ['exams-list', params],
    queryFn: () => getExamsListApi(params),
    staleTime: 1000 * 10,
  });
};

export const useAddExamMutation = () => {
  const navigate = useNavigate();
  const { refetch } = useExamsList();
  return useMutation({
    mutationFn: addExamApi,
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/exams');
      refetch();
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

export const useGetDataByIdExam = (id: number) => {
  return useQuery({
    queryKey: ['exams-list-get-byid', id],
    queryFn: () => GetDataByIdExamApi(id),
    staleTime: 1000 * 10,
  });
};

export const useUpdateExam = (id: number, payload: EditExamPayload, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => UpdateExamApi(id, payload),
    onSuccess: (data) => {
      displaySuccess(data?.message);
      navigate('/exams');
      queryclient.invalidateQueries({ queryKey: ['exams-list'] });
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

export const useExamDeleteById = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => ExamDeleteByIdApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message || 'Exam deleted successfully');
      navigate('/exams');
      queryclient.invalidateQueries({ queryKey: ['exams-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};
