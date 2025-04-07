import useFetchDataDjango from '@/hooks/api-request/use-fetch-data-django';
import usePostDataDjango from '@/hooks/api-request/use-post-data-django';
import useUpdateDataDjango from '@/hooks/api-request/use-update-date-django';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { ManualReviewItem, ManualReviewResponse } from '@/modules/DigitalMarking/ManualReview/ManualReview.types';
import { API } from '../endpoints';
import { QueryParams } from '../types/params';

export const useManualReviewData = (params: QueryParams, id: number) => {
  return useFetchDataDjango<ManualReviewResponse>({
    url: `${API.MANUAL_REVIEW.DETAILS}${id}/`,
    params: params,
  });
};

export const useUpdateManualReviewData = () => {
  return useUpdateDataDjango<ManualReviewItem>({
    url: `${API.MANUAL_REVIEW.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('Manual review data updated successfully', data);
      },
      onError: (error) => {
        console.log('Manual review data update failed', error);
      },
    },
  });
};

export const useFinalSubmitReviewData = () => {
  return usePostDataDjango({
    url: `${API.MANUAL_REVIEW.FINAL_SUBMIT}`,
    mutationOptions: {
      onSuccess: () => {
        displaySuccess('Submit Successfully');
      },
      onError: (error: any) => {
        displayError(error?.response?.data?.error);

        console.error('Data Submit failed', error);
      },
    },
  });
};
