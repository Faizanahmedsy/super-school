import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';

export const getDivisionListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.DIVISION.LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};
