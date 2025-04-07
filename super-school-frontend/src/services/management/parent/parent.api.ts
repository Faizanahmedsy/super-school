import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { ParentPayload } from '@/services/types/payload';

export const getParentListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.PARENT.LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const addParentApi = async (payload: ParentPayload): Promise<any> => {
  const response = await superAxios.post(`${API.PARENT.ADD}`, payload);

  if (response.data?.statusCode == 200) {
    return response?.data;
  }
};

export const getDataByIdParentApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.PARENT.PARENT_DATA_GET_BY_ID}${id}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const updateParentApi = async (id: number, payload: ParentPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.PARENT.UPDATE}${id}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const deleteParentApi = async (id: number): Promise<any> => {
  const response = await superAxios.delete(`${API.PARENT.DELETE}${id}`);
  return response?.data;
};
