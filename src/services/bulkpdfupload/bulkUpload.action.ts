import useDeleteDataDjango from '@/hooks/api-request/use-delete-data-django';
import usePostDataDjango from '@/hooks/api-request/use-post-data-django';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '../endpoints';

export const useSingleUploadData = () => {
  return usePostDataDjango({
    url: `${API.BULK_UPLOAD.SINGLE_UPLOAD}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        displaySuccess(data?.success);
      },
      onError: (err: any) => {
        if (err?.response?.data?.error) {
          // Handle case where error is an array
          if (Array.isArray(err.response.data.error)) {
            // Join multiple errors with line breaks or handle first error
            const errorMessage = err.response.data.error.map((e: any) => e.error).join('\n');
            displayError(errorMessage);
          } else {
            // Handle single error string
            displayError(err.response.data.error);
          }
        } else if (err?.response?.data?.detail) {
          displayError(err.response.data.detail);
        } else {
          displayError('An error occurred while submitting the form.');
        }
      },
    },
  });
};

export const useSingleDelete = () => {
  return useDeleteDataDjango({
    url: `${API.BULK_UPLOAD.SINGLE_UPLOAD_DELETE}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        console.log("data", data);
      },
      onError: (err: any) => {
        if (err?.response?.data?.error) {
          // Handle case where error is an array
          if (Array.isArray(err.response.data.error)) {
            // Join multiple errors with line breaks or handle first error
            const errorMessage = err.response.data.error.map((e: any) => e.error).join('\n');
            displayError(errorMessage);
          } else {
            // Handle single error string
            displayError(err.response.data.error);
          }
        } else if (err?.response?.data?.detail) {
          displayError(err.response.data.detail);
        } else {
          displayError('An error occurred while submitting the form.');
        }
      },
    },
  });
};

export const useBulkUploadData = () => {
  return usePostDataDjango({
    url: `${API.BULK_UPLOAD.BULK_UPLOAD}/`,
    mutationOptions: {
      onSuccess: (data: any) => {
        displaySuccess(data?.success);
      },
      onError: (err: any) => {
        if (err?.response?.data?.error) {
          // Handle case where error is an array
          if (Array.isArray(err.response.data.error)) {
            // Join multiple errors with line breaks or handle first error
            const errorMessage = err.response.data.error.map((e: any) => e.error || e.errors).join('\n');
            displayError(errorMessage);
          } else {
            // Handle single error string
            displayError(err.response.data.error);
          }
        } else if (err?.response?.data?.detail) {
          displayError(err.response.data.detail);
        } else {
          displayError('An error occurred while submitting the form.');
        }
      },
    },
  });
};

export const useChangeMemoData = () => {
  return usePostDataDjango({
    url: `${API.BULK_UPLOAD.CHANGE_MEMO}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        displaySuccess('File uploaded successfully');
      },
      onError: (err: any) => {
        console.log('Bulk File upload failed', err);

        if (err?.response?.data?.error) {
          // Handle case where error is an array
          if (Array.isArray(err.response.data.error)) {
            // Join multiple errors with line breaks or handle first error
            const errorMessage = err.response.data.error.map((e: any) => e.error).join('\n');
            displayError(errorMessage);
          } else {
            // Handle single error string
            displayError(err.response.data.error);
          }
        } else if (err?.response?.data?.detail) {
          displayError(err.response.data.detail);
        } else {
          displayError('An error occurred while submitting the form.');
        }
      },
    },
  });
};

export const useChangeQuestionData = () => {
  return usePostDataDjango({
    url: `${API.BULK_UPLOAD.CHANGE_QUESTION}`,
    mutationOptions: {
      onSuccess: () => {
        displaySuccess('File uploaded successfully');
      },
      onError: (err: any) => {
        console.log('Bulk File upload failed', err);

        if (err?.response?.data?.error) {
          // Handle case where error is an array
          if (Array.isArray(err.response.data.error)) {
            // Join multiple errors with line breaks or handle first error
            const errorMessage = err.response.data.error.map((e: any) => e.error).join('\n');
            displayError(errorMessage);
          } else {
            // Handle single error string
            displayError(err.response.data.error);
          }
        } else if (err?.response?.data?.detail) {
          displayError(err.response.data.detail);
        } else {
          displayError('An error occurred while submitting the form.');
        }
      },
    },
  });
};
