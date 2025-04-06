'use client';
import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { DoePayload, ParentPayload } from '@/services/types/payload';

export const getDoeListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.DOE.DOE_LIST}${qryString}`);

  return response?.data?.data;
};

export const addDoeApi = async (payload: DoePayload): Promise<any> => {
  const response = await superAxios.post(`${API.DOE.DOE_CREATE}`, payload);

  return response?.data;
};

export const getDataByIdDoeApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.DOE.DOE_DATA_GET_BY_ID}${id}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const updateDoeApi = async (id: number, payload: ParentPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.DOE.UPDATE}${id}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const deleteDoeApi = async (id: number): Promise<any> => {
  const response = await superAxios.delete(`${API.DOE.DELETE}${id}`);

  return response?.data;
};
