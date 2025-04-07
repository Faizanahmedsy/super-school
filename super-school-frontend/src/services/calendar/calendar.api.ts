'use client';
import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { DoePayload, ParentPayload } from '@/services/types/payload';

export const getEventListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.EVENT.LIST}${qryString}`);

  return response?.data?.data;
};

export const addEventApi = async (payload: DoePayload): Promise<any> => {
  const response = await superAxios.post(`${API.EVENT.ADD}`, payload);

  return response?.data;
};

export const getDataByIdEventApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.EVENT.EVENT_DATA_GET_BY_ID}${id}`);
  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const updateEventApi = async (id: number, payload: ParentPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.EVENT.UPDATE}${id}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const deleteEventApi = async (id: number): Promise<any> => {
  const response = await superAxios.delete(`${API.EVENT.DELETE}${id}`);

  return response?.data;
};
