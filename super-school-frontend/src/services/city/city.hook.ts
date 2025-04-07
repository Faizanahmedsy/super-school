import { useFetchData } from '@/hooks/api-request';
import { API } from '../endpoints';
import { QueryParams } from '../types/params';

export const useCityList = (params: QueryParams) => {
  return useFetchData({
    url: API.CITY.LIST,
    enabled: !!params.state_id,
  });
};
