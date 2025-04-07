import { useFetchDataDjango } from '@/hooks/api-request';
import { QueryParams } from '../types/params';
import { API } from '../endpoints';

export const useSchoolReportList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.REPORT_MANAGEMENT.SCHOOL_REPORT}`,
    params: params,
  });
};

export const useSchoolTeachersReportList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.REPORT_MANAGEMENT.SCHOOL_TEACHER_REPORT}`,
    params: params,
  });
};

export const useSchoolLearnersReportList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.REPORT_MANAGEMENT.SCHOOL_LEARNERS_REPORT}`,
    params: params,
  });
};

export const useSchoolParentsReportList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.REPORT_MANAGEMENT.SCHOOL_PARENT_REPORT}`,
    params: params,
  });
};

export const useSchoolAssessmentsReportList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.REPORT_MANAGEMENT.SCHOOL_ASSESSMENT_REPORT}`,
    params: params,
  });
};

export const useSchoolQuizzesReportList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.REPORT_MANAGEMENT.SCHOOL_QUIZZES_REPORT}`,
    params: params,
  });
};
