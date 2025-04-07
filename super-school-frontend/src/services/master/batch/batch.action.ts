import { usePostData } from '@/hooks/api-request';
import { API } from '@/services/endpoints';

export const useCreateBatch = () => {
  return usePostData({
    url: `${API.BATCH.ADD}`,
  });
};

export const useActivateBatch = () => {
  return usePostData({
    url: `${API.BATCH.ACTIVE}`,
  });
};
