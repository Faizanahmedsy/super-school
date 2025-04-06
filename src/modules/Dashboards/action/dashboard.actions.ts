import { useFetchDataDjango } from '@/hooks/api-request';
import { API } from '../../../services/endpoints';
import { QueryParams } from '../../../services/types/params';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { UserCountResp } from '../types/dashboard.types';

// CUSTOM HOOK TO ADD SCHOOL ID TO QUERY PARAMS
const useBuildParams = (params: QueryParams) => {
  const user = useGlobalState((state) => state.user);
  const roleName = user?.role_name;
  const schoolId = useRoleBasedSchoolId();

  if (roleName === ROLE_NAME.SUPER_ADMIN) {
    return { ...params, school_id: schoolId };
  }
  return params;
};

export const useStudentPerGrade = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.STUDENT_PER_GRADE}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};


export const useSubjectPerGrade = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.SUBJECT_PER_GRADE}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useTeacherinGrade = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.NUMBER_OF_TEACHERS_IN_GRADE}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useStudentInSubject = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.NUMBER_OF_STUDENTS_IN_SUBJECT}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useSubjectPassFailRate = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.SUBJECT_PASS_FAIL_RATE}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useUserCounts = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<UserCountResp>({
    url: `${API.DASHBOARD_CHART.USER_COUNT}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useSubjectQuize = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.SUBJECT_QUIZ}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useGradePassFailRate = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.GRADE_PASS_FAIL_RATE}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useCompareTwoYearGrade = (params: QueryParams, enabled: boolean = true) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.COMPARE_TWO_YEAR_GRADE}`,
    params: newParams,
    enabled: Boolean(enabled),
  });
};

export const useDigitalMarkingProcess = (params: QueryParams) => {
  const newParams = useBuildParams(params);

  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.DIGITAL_MARKING_PROGRESS}`,
    params: newParams,
    enabled: true,
  });
};

export const useDashboardQuizAnalytics = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.QUIZ_ANALYTICS}`,
    params: params,
  });
};

export const useDashboardAssessmentAnalytics = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.DASHBOARD_CHART.ASSESSMENT_ANALYTICS}`,
    params: params,
  });
};
