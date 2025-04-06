import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import useGlobalState from '@/store';

export function useRoleBasedLearnerId() {
  const user = useGlobalState((state) => state.user);
  const studentId = useGlobalState((state) => state.student_id);

  const userRole = user?.role_name;
  let learnerId = studentId;

  if (userRole == ROLE_NAME.PARENT) {
    return learnerId = studentId;
  }

  return learnerId;
}


