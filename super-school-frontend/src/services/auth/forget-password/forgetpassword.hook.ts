import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { setItem } from '@/lib/localstorage';
import { ForgotPasswordPayload } from '@/services/types/payload';
import { useMutation } from '@tanstack/react-query';
import { postForgetpasswordApi } from './forgetpassword.api';

export const usePostForgetpassword = (handleSuccess: (data: ForgotPasswordPayload) => void) => {
  return useMutation({
    mutationFn: postForgetpasswordApi,
    onError: (err: Error) => {
      if ('response' in err && typeof err.response === 'object' && err.response !== null) {
        const responseData = (err.response as any).data;
        if (responseData && typeof responseData.message === 'string') {
          displayError(responseData.message);
        } else {
          displayError('Something went wrong');
        }
      } else {
        displayError('Something went wrong');
      }
    },
    onSuccess: (data: any) => {
      if (data) {
        displaySuccess(data?.message);
        handleSuccess(data);
        setItem('reset_token', data?.data?.token);
        // navigate('/reset-password',);
      }
    },
    onSettled: () => {
      return true;
    },
  });
};
