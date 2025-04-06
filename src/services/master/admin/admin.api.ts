import { buildQueryString } from '@/lib/common-functions';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { QueryParams } from '@/services/types/params';
import { AddAdminPayload, EditAdminPayload } from '@/services/types/payload';

export const getAdminListApi = async (params: QueryParams): Promise<any> => {
  const queryString = buildQueryString(params);
  const response = await superAxios.get(`${API.ADMIN.LIST}${queryString}`);
  if (response?.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const addAdminApi = async (payload: AddAdminPayload): Promise<any> => {
  const response = await superAxios.post(`${API.ADMIN.ADD}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const GetDataByIdAdminApi = async (id: number): Promise<any> => {
  const response = await superAxios.get(`${API.ADMIN.ADMIN_DATA_GET_BY_ID}${id}`);

  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};

export const UpdateAdminApi = async (id: number, payload: EditAdminPayload): Promise<any> => {
  const response = await superAxios.patch(`${API.ADMIN.UPDATE}${id}`, payload);
  if (response.data?.statusCode == 200) {
    return response?.data;
  } else {
    return false;
  }
};

export const AdminDeleteByIdApi = async (id: number): Promise<any> => {
  const response = await superAxios.delete(`${API.ADMIN.DELETE}${id}`);
  if (response.data?.statusCode == 200) {
    return response?.data?.data;
  } else {
    return false;
  }
};
