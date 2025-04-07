import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { StudentPayload } from '@/services/types/payload';

export const getStudentsListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.STUDENT.LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const getParentStudentsListApi = async (params: QueryParams): Promise<any> => {
  const qryString = buildQueryString(params);
  const response = await superAxios.get(`${API.STUDENT.PARENT_STUDENT_LIST}${qryString}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const addStudentstApi = async (payload: StudentPayload): Promise<any> => {
  const response = await superAxios.post(`${API.STUDENT.ADD}`, payload);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  }
};

export const getDataByIdStudentsApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.STUDENT.STUDENT_LIST_GET_BY_ID}${id}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const updateStudentsApi = async (id: number, payload: StudentPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.STUDENT.UPDATE}${id}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const deleteStudentsApi = async (id: number): Promise<any> => {
  const response = await superAxios.delete(`${API.STUDENT.DELETE}${id}`);

  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const updateParentsApi = async (payload: StudentPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.STUDENT.DELETE_PARENTS_FROM_LEARNER}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};
