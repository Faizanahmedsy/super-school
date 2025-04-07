import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import { SchoolType } from '@/types/types';

export function useRoleBasedSchoolType() {
  const user = useGlobalState((state) => state.user);
  const masterSchool = useGlobalState((state) => state.masterSchool);

  const userRole = user?.role_name;
  const schoolType: SchoolType = user?.school?.school_type;

  if (userRole === ROLE_NAME.SUPER_ADMIN) {
    return masterSchool?.school_type;
  } else if (schoolType) {
    return schoolType;
  } else {
    console.error('No school type found');
  }
  return schoolType;
}
