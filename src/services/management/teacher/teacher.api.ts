import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { TeacherPayload } from '@/services/types/payload';

export const getTeacherListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.TEACHER.LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const addTeacherApi = async (payload: TeacherPayload): Promise<any> => {
  const response = await superAxios.post(`${API.TEACHER.ADD}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const getDataByIdTeacherApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.TEACHER.TEACHER_DATA_GET_BY_ID}${id}`);
  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const getSubjectListByIdTeacherApi = async (params: any, id: any): Promise<any> => {


  const queryString = buildQueryString(params as QueryParams);

  const response = await superAxios.get(`${API.TEACHER.TEACHER_SUBJECTLIST_GET_BY_ID}${id}${queryString}`);
  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};
export const updateTeacherApi = async (id: number, payload: TeacherPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.TEACHER.UPDATE}${id}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const deleteTeacherApi = async (id: number): Promise<any> => {
  await superAxios.delete(`${API.TEACHER.DELETE}${id}`);
};
