import { useFetchDataDjango } from '@/hooks/api-request';
import { API } from '../endpoints';
import { QueryParams } from '../types/params';

export const useGradingProgressList = (params: QueryParams) => {
  return useFetchDataDjango<any>({
    url: `${API.GRADING_PROGRESS.LIST}`,
    params: params,
  });
};
