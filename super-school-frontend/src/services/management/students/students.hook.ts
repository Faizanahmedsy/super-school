import { useFetchDetails, usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { StudentPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteStudentsApi, getDataByIdStudentsApi, getParentStudentsListApi, getStudentsListApi, updateParentsApi, updateStudentsApi } from './student.api';

export const useStudentList = (params: QueryParams, enable?: boolean) => {
  return useQuery({
    queryKey: ['students-list', params],
    queryFn: () => getStudentsListApi(params),
    staleTime: 1000 * 10,
    retry: 1,
    enabled: enable
  });
};


export const useParentStudentList = (params: QueryParams, enable?: boolean) => {
  return useQuery({
    queryKey: ['parent-students-list', params],
    queryFn: () => getParentStudentsListApi(params),
    staleTime: 1000 * 10,
    retry: 1,
    enabled: enable
  });
};

export const useAddStudentMutation = () => {
  return usePostData({
    url: API.STUDENT.ADD,
  });
};

export const useStudentGetDataById = (id: number) => {
  return useQuery({
    queryKey: ['parent-list-get-byid', id],
    queryFn: () => getDataByIdStudentsApi(id),
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
};

export const useStudentDetails = (id: string) => {
  return useFetchDetails({
    url: API.STUDENT.STUDENT_LIST_GET_BY_ID,
    id,
  });
};

export const useUpdateStudent = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: StudentPayload) => updateStudentsApi(id, payload),
    onSuccess: (data) => {
      queryclient.invalidateQueries({ queryKey: ['students-list'] });
      displaySuccess(data?.message);
      navigate('/learner/list');
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

export const useStudentDeleteById = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteStudentsApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message || 'Students deleted successfully');
      navigate('/learner/list');
      queryclient.invalidateQueries({ queryKey: ['students-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};


export const useUpdateStudentParents = (queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: any) => updateParentsApi(payload),
    onSuccess: (data) => {
      console.log('data?.message', data?.message);

      // queryclient.invalidateQueries({ queryKey: ['students-list'] });
      displaySuccess(data?.message);
      // navigate('/learner/list');
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
