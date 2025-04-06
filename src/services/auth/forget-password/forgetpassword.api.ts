import { ForgotPasswordPayload } from '@/services/types/payload';
import { API } from '../../endpoints';
import superAxios from '../../instance';

export const postForgetpasswordApi = async (payload: ForgotPasswordPayload) => {
  const resp = await superAxios.post(API.AUTH.FORGET_PASSWORD, payload);
  return resp.data;
};
