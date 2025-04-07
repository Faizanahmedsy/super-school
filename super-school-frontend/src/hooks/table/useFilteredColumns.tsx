import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

/**
 * A generic hook to filter table columns based on user role and optionally add new columns.
 *
 * @param columns - The original array of columns.
 * @param restrictedKeys - An array of keys to be removed for specific roles.
 * @param additionalColumns - An optional array of columns to be added for specific roles.
 * @returns Filtered and potentially extended array of columns.
 */
const useFilteredColumns = <T extends object>(
  columns: ColumnDef<T>[],
  restrictedKeys: string[] = [],
  additionalColumns: ColumnDef<T>[] = []
): ColumnDef<T>[] => {
  // Extract user state using the global state hook
  const user = useGlobalState((state) => state.user);
  const role = user?.role_name;

  return useMemo(() => {
    let filteredColumns = columns;

    if (role === ROLE_NAME.SUPER_ADMIN || role === ROLE_NAME.TEACHER) {
      // Filter out restricted columns
      filteredColumns = columns.filter(
        (column) => !restrictedKeys.includes((column as { accessorKey?: string }).accessorKey ?? '')
      );

      // Append additional columns for `super_admin`
      filteredColumns = [...filteredColumns, ...additionalColumns];
    }

    return filteredColumns;
  }, [columns, restrictedKeys, additionalColumns, role]);
};

export default useFilteredColumns;
