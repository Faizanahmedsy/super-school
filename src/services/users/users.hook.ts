import { useFetchDetails } from '@/hooks/api-request';
import { API } from '../endpoints';

export const useUserDetails = (id: number) => {
  return useFetchDetails({
    url: API.USER.DETAIL,
    id,
  });
};
