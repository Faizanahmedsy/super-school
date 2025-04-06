import { useFetchData, useFetchDetails, usePostData } from '@/hooks/api-request';
import { SupportLogDetailsResp } from '@/modules/Settings/types/support-log.types';
import { API } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';

export const useAddReport = () => {
  return usePostData({
    url: `${API.HELP_AND_SUPPORT.ADD_REPORT}`,
  });
};

export const useFetchReportList = (params: QueryParams) => {
  return useFetchData<any>({
    url: `${API.HELP_AND_SUPPORT.GET_REPORT_LIST}`,
    params: params,
  });
};

export const useReportDetails = (id: number) => {
  return useFetchDetails<SupportLogDetailsResp>({
    url: `${API.HELP_AND_SUPPORT.GET_REPORT}`,
    id,
  });
};
