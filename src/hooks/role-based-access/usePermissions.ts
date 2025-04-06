import { useMemo } from 'react';
import canPerformAction from '@/lib/common-functions';
import useRoleBasedAccess from '@/store/useRoleBasedAccess';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

type Action = 'add' | 'edit' | 'view' | 'delete';

// Custom hook to check if the user has permission for a given action on a module
export default function usePermission(moduleName: string, action: Action): boolean {
  const user = useRoleBasedAccess((state) => state.user);

  const hasPermission = useMemo(() => {
    if (user?.role_name === ROLE_NAME.SUPER_ADMIN) {
      return true;
    }
    return canPerformAction(moduleName, action);
  }, [moduleName, action, user]);

  return hasPermission;
}
