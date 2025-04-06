import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import useGlobalState from '@/store';

export function useRoleBasedSchoolId() {
  const user = useGlobalState((state) => state.user);
  const masterSchool = useGlobalState((state) => state.masterSchool);

  const userRole = user?.role_name;
  let schoolId = user?.school?.id

  if (userRole == ROLE_NAME.PARENT) {
    return schoolId = user?.details?.school_id;
  }

  if (userRole === ROLE_NAME.SUPER_ADMIN || userRole === ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    if (masterSchool?.id) {
      return masterSchool?.id;
    }
  } else if (userRole === ROLE_NAME.ADMIN) {
    return schoolId;
  } else if (schoolId) {
    return schoolId;
  } else {
    displayError('No school found');
  }
  return schoolId;
}
