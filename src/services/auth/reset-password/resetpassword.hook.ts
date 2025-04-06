import { usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { API } from '@/services/endpoints';
import { useNavigate } from 'react-router-dom';

export const usePostResetpassword = () => {
  const navigate = useNavigate();
  return usePostData({
    url: API.AUTH.RESET_PASSWORD,
    mutationOptions: {
      onSuccess: (data: any) => {
        if (data?.statusCode == 200) {
          // displaySuccess(data?.message);
          navigate('/signin');
        }
      },
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
      onSettled: () => {
        return true;
      },
    },
  });
};
