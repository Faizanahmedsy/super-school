import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';

export const getInstituteListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.INSTITUTE.LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const addInstituteApi = async (payload: unknown): Promise<any> => {
  const response = await superAxios.post(`${API.INSTITUTE.ADD}`, payload);

  if (response.data?.statusCode == 201) {
    return response?.data?.data;
  }
};

export const deleteInstituteApi = async (id: number): Promise<any> => {
  await superAxios.delete(`${API.INSTITUTE.DELETE}${id}`);
};

export const updateInstituteApi = async (payload: unknown, id: number): Promise<any> => {
  const response = await superAxios.patch(`${API.INSTITUTE.UPDATE}${id}`, payload);

  if (response.data?.statusCode == 200) {
    return response?.data;
  }
};

export const getInstituteDetailsApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.INSTITUTE.DETAILS}${id}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};
