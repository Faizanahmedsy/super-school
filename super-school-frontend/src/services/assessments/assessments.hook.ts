import { useFetchData } from '@/hooks/api-request';
import useDeleteDataDjango from '@/hooks/api-request/use-delete-data-django';
import useFetchDataDjango from '@/hooks/api-request/use-fetch-data-django';
import usePostDataDjango from '@/hooks/api-request/use-post-data-django';
import useUpdateDataDjango from '@/hooks/api-request/use-update-date-django';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';

export const useBatchList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.BATCH.LIST}`,
    params: params,
  });
};

export const useSubjectWiseStudents = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.STUDENT.SUBJECT_WISE}`,
    params: params,
  });
};

export const useAssessmentList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.ASSESSMENT.LIST}`,
    params: params,
  });
};

export const useAssessmentWiseStudentstList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.STUDENTS_LIST.LIST}`,
    params: params,
  });
};

export const useAssessmentWiseStudentstDetails = (id: number, params?: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.STUDENTS_LIST.LIST}${id}/`,
    params: params,
  });
};

export const useSubjectWiseAssessmentList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.SUBJECT_WISE_ASSESSMENT.LIST}`,
    params: params,
  });
};

export const useAssessmentDetails = (id: any, params?: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.ASSESSMENTS_DETAILS.LIST}${id}`,
    params: params,
    enabled: Boolean(id),
  });
};

export const useSubjectDetailsList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.SUBJECT_WISE_ASSESSMENT.LIST}`,
    params: params,
  });
};

export const useAssessmentCreate = ({ school_id }: { school_id?: number }) => {
  const setAssessmentId = useGlobalState((state) => state.setAssessmentId);

  let url = `${API.ASSESSMENT.ADD}`;

  return usePostDataDjango({
    url: url,
    mutationOptions: {
      onSuccess: (data: any) => {
        setAssessmentId(data.id);
      },
    },
  });
};

export const useSubjectWiseAssessmentCreate = ({ school_id }: { school_id?: number }) => {
  let url = `${API.SUBJECT_WISE_ASSESSMENT.ADD}`;
  return usePostDataDjango({
    url: url,
  });
};

export const useAssessmentGetById = (id: any) => {
  return useFetchDataDjango<any>({
    url: `${API.ASSESSMENT.LIST}${id}`,
    enabled: Boolean(id),
  });
};

export const useOcrStart = (id: any) => {
  return usePostDataDjango({
    url: `${API.OCR_START.LIST}${id}/`,
    mutationOptions: {
      onError: (error: any) => {
        console.log('error?.response?.data?.errors[0]?.error', error?.response?.data?.errors[0]?.error),
          displayError(error?.response?.data?.errors[0]?.error);
        // displayError({
        //   content: error?.response?.data?.errors[0]?.error,
        //   duration: 5,
        // });
      },
    },
  });
};

export const useAssessmentUpdate = () => {
  // const AssessmentId = useGlobalState((state) => state.setAssessmentId);
  return useUpdateDataDjango({
    url: `${API.ASSESSMENT.UPDATE}`,
    mutationOptions: {
      onSuccess: () => {
        // AssessmentId(data.id);
      },
      onError: (error: any) => {
        console.error('Update Assessments failed', error);
        displayError(error.response.data.error);

        // messageApi.open({
        //     type: 'error',
        //     content: error.response.data.error,
        //     duration: 5,
        // });
      },
    },
  });
};

export const useAssessmentDelete = () => {
  return useDeleteDataDjango({
    url: `${API.ASSESSMENT.DELETE}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        displaySuccess('Delete Assessments Successfully');
      },
      onError: (error) => {
        console.error('Delete Assessments failed', error);
      },
    },
  });
};

export const useSubjectWiseAssessmentDelete = () => {
  return useDeleteDataDjango({
    url: `${API.SUBJECT_WISE_ASSESSMENT.DELETE}`,
    mutationOptions: {
      onSuccess: () => {
        displaySuccess('Delete Assessments Successfully');
      },
      onError: (error) => {
        console.error('Delete Assessments failed', error);
      },
    },
  });
};
