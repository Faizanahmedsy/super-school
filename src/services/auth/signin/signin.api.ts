import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { LoginPayload } from '@/services/types/payload';

export const postLoginApi = async (payload: LoginPayload) => {
  const resp = await superAxios.post(API.AUTH.LOGIN, payload);
  return resp.data;
};
