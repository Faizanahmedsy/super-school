import { ChangePasswordPayload } from '@/services/types/payload';
import { API } from '../../endpoints';
import superAxios from '../../instance';

export const postChangepasswordApi = async (payload: ChangePasswordPayload) => {
  const resp = await superAxios.post(API.AUTH.CHANGE_PASSWORD, payload);
  return resp.data;
};
