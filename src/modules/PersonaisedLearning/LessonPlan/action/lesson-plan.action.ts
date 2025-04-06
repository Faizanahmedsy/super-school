import {
  useDeleteData,
  useDeleteDataDjango,
  useFetchDataDjango,
  useFetchDetails,
  useFetchDetailsDjango,
  usePostDataDjango,
  useUpdateData,
  useUpdateDataDjango,
} from '@/hooks/api-request';
import { API } from '../../../../services/endpoints';
import { QueryParams } from '../../../../services/types/params';
import { useQuery } from '@tanstack/react-query';
import { TreeDataNode } from 'antd';
import djangoAxios from '@/services/djangoInstance';

export const useLessonPlanList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.LESSON_PLAN.LIST}`,
    params: params,
  });
};

export const useCreateLessonPlan = () => {
  return usePostDataDjango({
    url: `${API.LESSON_PLAN.ADD}`,
  });
};

export const useUpdateLessonPlan = () => {
  return useUpdateDataDjango({
    url: `${API.LESSON_PLAN.UPDATE}`,
    method: 'put',
  });
};

export const useDeleteLessonPlan = () => {
  return useDeleteDataDjango({
    url: `${API.LESSON_PLAN.DELETE}`,
  });
};

export const useLessonPlanDetails = (id: number) => {
  return useQuery<any, Error>({
    queryKey: [API.LESSON_PLAN.GET_DETAIL_BY_ID, id], // Default queryKey includes the URL and ID for caching
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required to fetch details.');
      }
      const response = await djangoAxios.get(`${API.LESSON_PLAN.GET_DETAIL_BY_ID}${id}`);

      if (response.data) {
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to fetch details.');
    },
    enabled: !!id,
    retry: false,
  });
};
