import { ResetPasswordPayload } from '@/services/types/payload';
import { API } from '../../endpoints';
import superAxios from '../../instance';

export const postResetpasswordApi = async (payload: ResetPasswordPayload) => {
  const resp = await superAxios.post(API.AUTH.RESET_PASSWORD, payload);
  return resp.data;
};
