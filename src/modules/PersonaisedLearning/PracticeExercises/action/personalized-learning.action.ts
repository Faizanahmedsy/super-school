import { useFetchDataDjango, usePostDataDjango } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import {
  MainQuizDetailsResp,
  MainQuizResp,
  QuizAssessmentStudentWeaknessResp,
  QuizListData,
  RetrieveQuizStudentAnswerDetails,
  StudentAnalyticsResp,
  StudentAssessmentResp,
  StudentWeaknessResp,
} from '@/modules/PersonaisedLearning/PracticeExercises/types/practice-exercises.types';
import djangoAxios from '@/services/djangoInstance';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAssessmentAnalytics = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.ANALYTICS.ANALYTICS}`,
    params: params,
  });
};

export const useStrengthsAndWeaknesses = (params: QueryParams) => {
  return useFetchDataDjango<StudentWeaknessResp>({
    url: `${API.ANALYTICS.STRENGTHS_AND_WEAKNESSES}`,
    params: params,
  });
};

export const useStudentAnalytics = (params: QueryParams, enabled?: boolean) => {
  return useFetchDataDjango<StudentAssessmentResp>({
    url: `${API.ANALYTICS.ANSWERSHEET_MARKS}`,
    params: params,
    enabled: enabled,
  });
};

export const useMainQuizList = (params: QueryParams) => {
  return useFetchDataDjango<MainQuizResp>({
    url: `${API.QUIZ.MAIN_QUIZ}`,
    params: params,
  });
};

export const useGenerateQuiz = () => {
  return usePostDataDjango<any>({
    url: `${API.QUIZ.GENERATE_QUIZ}`,
  });
};

export const useGenerateSelfQuiz = () => {
  return usePostDataDjango<any>({
    url: `${API.QUIZ.GENERATE_SELF_QUIZ}`,
  });
};

export const useAttemptQuiz = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const response = await djangoAxios.patch(`${API.QUIZ.ATTEMPT_QUIZ}`, data);
      if (response) {
        return response.data;
      }
      throw new Error('Failed to post data');
    },
    retry: false,
  });
};

export const useCreateManualQuiz = () => {
  return usePostDataDjango<any>({
    url: `${API.QUIZ.CREATE_MANUAL_QUIZ}`,
  });
};

export const useQuizList = (params: QueryParams, enabled: boolean = true) => {
  return useFetchDataDjango<QuizListData>({
    url: `${API.QUIZ.LIST}`,
    params: params,
    enabled: enabled,
  });
};

export const useQuizDetails = (id: number) => {
  return useQuery<MainQuizDetailsResp, Error>({
    queryKey: [API.QUIZ.QUIZ_DETAILS, id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required to fetch details.');
      }
      const response = await djangoAxios.get(`${API.QUIZ.QUIZ_DETAILS}${id}/`);
      if (response?.status === 200) {
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to fetch details.');
    },
    enabled: !!id,
    retry: false,
  });
};

export const useRetriveQuizDetails = (id: number) => {
  return useQuery<RetrieveQuizStudentAnswerDetails, Error>({
    queryKey: [API.QUIZ.RETRIEVE_QUIZ, id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required to fetch details.');
      }
      const response = await djangoAxios.get(`${API.QUIZ.RETRIEVE_QUIZ}${id}/`);
      if (response?.status === 200) {
        return response.data;
      }
      throw new Error(response.data?.message || displayError(response.data?.message) || 'Failed to fetch details.');
    },
    enabled: !!id,
    retry: false,
  });
};

export const useStudentStats = (params: QueryParams) => {
  return useFetchDataDjango<StudentAnalyticsResp>({
    url: `${API.QUIZ.STUDENT_STATS}`,
    params: params,
  });
};

export const useQuizAssessmentStrengthsAndWeaknesses = (params: QueryParams) => {
  return useFetchDataDjango<QuizAssessmentStudentWeaknessResp>({
    url: `${API.QUIZ.STRENGTH_AND_WEAKNESS}`,
    params: params,
  });
};

export const useUpdateQuiz = () => {
  return useMutation<any, Error, any>({
    mutationFn: async ({ id, payload }) => {
      const response = await djangoAxios.patch(`${API.QUIZ.UPDATE_QUIZ}${id}/`, payload);
      if (response) {
        return response.data;
      }
      throw new Error('Failed to post data');
    },
    retry: false,
  });
};
