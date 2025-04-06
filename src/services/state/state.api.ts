import { buildQueryString } from '@/lib/common-functions';
import superAxios from '@/services/instance';
import { QueryParams } from '../types/params';
import { API } from '../endpoints';

export const getStateListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.STATE.LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};
