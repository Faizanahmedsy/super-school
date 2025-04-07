import { API } from '@/services/endpoints';
import { InstituteApiResponse } from '@/modules/Management/Institutes/types';
import { QueryParams } from '@/services/types/params';
import { useDeleteData, useFetchData, useFetchDetails, usePostData, useUpdateData } from '@/hooks/api-request';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export const useInstituteList = (params: QueryParams, enabled: boolean = true) => {
  const user = useGlobalState((state) => state.user);

  if (user?.role_name != ROLE_NAME.SUPER_ADMIN && user?.role_name != ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    enabled = false;
  }

  return useFetchData<InstituteApiResponse>({
    url: `${API.INSTITUTE.LIST}`,
    params: params,
    enabled: Boolean(enabled),
  });
};

export const useCreateInstitute = () => {
  return usePostData({
    url: `${API.INSTITUTE.ADD}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        localStorage.setItem('school_id', JSON.stringify(data?.data?.id));
      },
      onError: (error) => {
        console.log('School addition failed', error);
      },
    },
  });
};

export const useUpdateInstitute = () => {
  return useUpdateData({
    url: `${API.INSTITUTE.UPDATE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('School updated successfully', data);
      },
      onError: (error) => {
        console.log('School update failed', error);
      },
    },
  });
};

export const useDeleteInstitute = () => {
  return useDeleteData({
    url: `${API.INSTITUTE.DELETE}`,
    mutationOptions: {
      onSuccess: (data) => {
        console.log('School deleted successfully', data);
      },
      onError: (error) => {
        console.log('School deletion failed', error);
      },
    },
  });
};

export const useInstituteDetails = (id: number) => {
  return useFetchDetails({
    url: API.INSTITUTE.DETAILS,
    id,
    queryOptions: {},
  });
};
