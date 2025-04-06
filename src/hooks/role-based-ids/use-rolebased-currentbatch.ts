import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import useGlobalState from '@/store';

export function useRoleBasedCurrentBatch() {
  const user = useGlobalState((state) => state.user);

  const masterSchool = useGlobalState((state) => state.masterSchool);

  const userRole = user?.role_name;
  let batchId = user?.cur_batch?.id

  if (userRole === ROLE_NAME.PARENT && user?.details?.students && user?.details?.students.length > 0 && Array.isArray(user?.details?.students)) {
    return batchId = user?.details?.students[0]?.cur_batch_id;
  }

  if (userRole === ROLE_NAME.SUPER_ADMIN || userRole === ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    return masterSchool?.cur_batch?.id;
  } else if (batchId) {
    return batchId;
  } else {
    displayError('No Batch found');
  }
  return batchId;
}
