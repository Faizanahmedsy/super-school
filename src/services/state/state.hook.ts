import { useQuery } from '@tanstack/react-query';
import { getStateListApi } from './state.api';
import { QueryParams } from '../types/params';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export const useStateList = (params: QueryParams) => {
  const user = useGlobalState((state) => state.user);
  let enabled = false;

  if (user?.role_name || (user?.role_name === ROLE_NAME.SUPER_ADMIN || user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION)) {
    enabled = true;
  }

  return useQuery({
    queryKey: ['state-list'],
    queryFn: () => getStateListApi(params),
    retry: 1,
    enabled: !!enabled,
  });
};
