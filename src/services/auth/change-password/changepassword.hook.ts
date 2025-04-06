import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useMutation } from '@tanstack/react-query';
import { postChangepasswordApi } from './changepassword.api';

export const usePostChangepassword = () => {
  return useMutation({
    mutationFn: postChangepasswordApi,
    onError: (err: Error) => {
      console.log('error', err);
    },
    onSuccess: (data: any) => {
      if (data) {
        displaySuccess(data?.message);
      }
    },
    onSettled: () => {
      return true;
    },
  });
};
