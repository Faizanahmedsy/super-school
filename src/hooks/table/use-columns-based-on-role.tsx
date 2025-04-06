import useGlobalState from '@/store';
import { useMemo } from 'react';

interface Column {
  accessorKey?: string;
  header: string;
  id?: string;
}

interface UseColumnBasedOnRoleProps {
  columns: Column[];
  restrictedKeys: string[];
  additionalColumns?: Column[];
  roleName: string;
}

/**
 * A generic hook to filter table columns based on user role and optionally add new columns.
 *
 * @param columns - The original array of columns.
 * @param restrictedKeys - An array of keys to be removed for specific roles.
 * @param additionalColumns - An optional array of columns to be added for specific roles.
 * @param roleName - The role to apply the restrictions and additions.
 * @returns Filtered and potentially extended array of columns.
 */
const useColumnBasedOnRole = ({
  columns,
  restrictedKeys,
  additionalColumns = [],
  roleName,
}: UseColumnBasedOnRoleProps): Column[] => {
  const user = useGlobalState((state) => state.user);
  const role = user?.role_name;

  return useMemo(() => {
    let filteredColumns = columns;

    if (role === roleName) {
      // Filter out restricted columns
      filteredColumns = columns.filter((column) => !restrictedKeys.includes(column.accessorKey ?? ''));

      // Append additional columns
      filteredColumns = [...filteredColumns, ...additionalColumns];
    }

    return filteredColumns;
  }, [columns, restrictedKeys, additionalColumns, role]);
};

export default useColumnBasedOnRole;
