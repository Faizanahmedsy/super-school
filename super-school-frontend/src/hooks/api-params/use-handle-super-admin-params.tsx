import { QueryParams } from '@/services/types/params';
import useGlobalUserState from '@/store/user-store';
import { useRoleBasedSchoolId } from '../role-based-ids/use-rolebased-school-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

/**
 * Custom hook to handle query parameters for a super admin user.
 *
 * If the user has the role of `SUPER_ADMIN` and `school_id` is missing,
 * it adds `school_id` to the query parameters.
 *
 * @param {QueryParams} params - The original query parameters.
 * @returns {QueryParams} - The modified query parameters.
 */

const useHandleSuperAdminParams = (params: QueryParams = {}): QueryParams => {
  const user = useGlobalUserState((state) => state.user);
  const roleName = user?.role_name;
  const schoolId = useRoleBasedSchoolId();

  if (
    (roleName === ROLE_NAME.SUPER_ADMIN && !params.school_id) ||
    (roleName === ROLE_NAME.DEPARTMENT_OF_EDUCATION && !params.school_id)
  ) {
    return { ...params, school_id: schoolId };
  }

  return params;
};

export default useHandleSuperAdminParams;
