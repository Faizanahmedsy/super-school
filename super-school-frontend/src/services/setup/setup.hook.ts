import { usePostData } from '@/hooks/api-request';
import { API } from '../endpoints';

export const useAddBatchMutation = () => {
  return usePostData({
    url: `${API.SETUP.BATCH}`,
  });
};
