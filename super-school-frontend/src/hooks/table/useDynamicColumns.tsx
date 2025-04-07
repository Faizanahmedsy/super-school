import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

/**
 * A generic hook to filter table columns and optionally add new columns.
 *
 * @param columns - The original array of columns.
 * @param restrictedKeys - An array of keys to be removed for specific roles.
 * @param additionalColumns - An optional array of columns to be added for specific roles.
 * @returns Filtered and potentially extended array of columns.
 */
const useDynamicColumns = <T extends object>(
  columns: ColumnDef<T>[],
  restrictedKeys: string[] = [],
  additionalColumns: ColumnDef<T>[] = []
): ColumnDef<T>[] => {
  return useMemo(() => {
    if (restrictedKeys.length === 0) {
      return columns;
    }

    let filteredColumns = columns;

    // Filter out restricted columns
    filteredColumns = columns.filter(
      (column) => !restrictedKeys.includes((column as { accessorKey?: string }).accessorKey ?? '')
    );

    // Append additional columns
    filteredColumns = [...filteredColumns, ...additionalColumns];

    return filteredColumns;
  }, [columns, restrictedKeys, additionalColumns]);
};

export default useDynamicColumns;
