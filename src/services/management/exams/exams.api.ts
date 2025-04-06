import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { AddExamPayload, EditExamPayload } from '@/services/types/payload';

export const getExamsListApi = async (params: QueryParams): Promise<any> => {
  const queryString = buildQueryString(params);
  const response = await superAxios.get(`${API.EXAMS.LIST}${queryString}`);
  if (response.status == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const addExamApi = async (payload: AddExamPayload): Promise<any> => {
  const response = await superAxios.post(`${API.EXAMS.ADD}`, payload);
  if (response.data?.status) {
    return response?.data;
  } else {
    return false;
  }
};

export const GetDataByIdExamApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.EXAMS.EXAM_LIST_GET_BY_ID}${id}`);
  if (response.data?.status) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const UpdateExamApi = async (id: number, payload: EditExamPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.EXAMS.UPDATE}${id}`, payload);
  if (response.data?.status) {
    return response?.data;
  } else {
    return false;
  }
};

export const ExamDeleteByIdApi = async (id: number): Promise<any> => {
  const response = await superAxios.delete(`${API.EXAMS.DELETE}${id}`);
  if (response.data?.status) {
    return response?.data?.data;
  } else {
    return false;
  }
};
