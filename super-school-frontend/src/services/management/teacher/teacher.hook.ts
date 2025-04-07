import { usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { TeacherPayload } from '@/services/types/payload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  addTeacherApi,
  deleteTeacherApi,
  getDataByIdTeacherApi,
  getSubjectListByIdTeacherApi,
  getTeacherListApi,
  updateTeacherApi,
} from './teacher.api';

// interface getTeacherPayload {
//   page: number;
//   limit: number;
//   search: string;
//   city_id: string;
//   state_id: string;
//   id: number;
// }

export const useTeachereList = (params: QueryParams) => {
  return useQuery({
    queryKey: ['teacher-list', params],
    queryFn: () => getTeacherListApi(params),
    staleTime: 1000 * 10,
    retry: 1,
  });
};

export const useAddTeacherSubjects = () => {
  return usePostData({
    url: API.DIVISION_SUBJECT.TEACHER_SETUP,
    mutationOptions: {
      onSuccess: (data) => {
      },
      onError: (error) => {
        console.log('teacher addition failed', error);
      },
    },
  });
};

export const useCreateInstitute = () => {
  return usePostData({
    url: `${API.INSTITUTE.ADD}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        localStorage.setItem('school_id', JSON.stringify(data?.data?.id));
      },
      onError: (error) => {
        console.log('School addition failed', error);
      },
    },
  });
};

export const useAddTeacherMutation = () => {
  return useMutation({
    mutationFn: addTeacherApi,
    onSuccess: (data) => {
      // displaySuccess(data?.message);
      // navigate(`/setupsubject/${data.id}`);
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

export const useTeacherGetDataById = (id: number) => {
  return useQuery({
    queryKey: ['teacher-list-get-byid', id],
    queryFn: () => getDataByIdTeacherApi(id),
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
};

export const useTeacherSubjectlistGetDataById = (params: QueryParams, id: number) => {
  return useQuery({
    queryKey: ['teacher-subject-list-get-byid', params],
    queryFn: () => getSubjectListByIdTeacherApi(params, id),
    enabled: Boolean(id),
  });
};

export const useUpdateTeacher = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: TeacherPayload) => updateTeacherApi(id, payload),
    onSuccess: (data) => {
      displaySuccess(data?.message);
      queryclient.invalidateQueries({ queryKey: ['teacher-list'] });
      navigate('/teacher/list');
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

export const useTeacherDeleteById = (id: number, queryclient: any) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteTeacherApi(id),
    onSuccess: (data: any) => {
      displaySuccess(data?.message || 'Teacher deleted successfully');
      navigate('/teacher/list');
      queryclient.invalidateQueries({ queryKey: ['teacher-list'] });
    },
    onError: (error: any) => {
      console.error('onError', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      displayError(errorMessage);
    },
  });
};
