import useFetchDataDjango from '@/hooks/api-request/use-fetch-data-django';
import { useMutation, useQuery } from '@tanstack/react-query';
import { API } from '../endpoints';
import djangoAxios from '../djangoInstance';
import { QueryParams } from '../types/params';
import { buildQueryString } from '@/lib/common-functions';

export const useDownloadCoverpage = (params: { ordering: any; assessment_subject_id: number }, fireDownload: any) => {
  return useQuery<any, Error>({
    queryKey: [API.DOWNLOAD_COVER_PAGE.GET, params.assessment_subject_id],
    queryFn: async () => {
      const queryString = buildQueryString(params as QueryParams);

      try {
        const response = await djangoAxios.get(`${API.DOWNLOAD_COVER_PAGE.GET}${queryString}`);
        if (response.status === 200) {
          return response.data;
        }
        throw new Error(`Unexpected response status: ${response.status}`);
      } catch (error: any) {
        console.error('useFetchDataDjango error:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0,
    enabled: Boolean(fireDownload),
  });
};


const deleteCoverPaper = async (assessmentSubjectId: number) => {
  const url = `/assessments-subjects/delete-cover-paper/?assessment_subject_id=`;

  const response = await djangoAxios.delete(`${url}${assessmentSubjectId}`);

  return response.data;
};

export const useCoverpageDelete = () => {
  return useMutation({
    mutationFn: deleteCoverPaper,
    onSuccess: (data) => {
      console.log('Cover paper deleted successfully:', data);
    },
    onError: (error) => {
      console.error('Error deleting cover paper:', error);
    },
  });
};
