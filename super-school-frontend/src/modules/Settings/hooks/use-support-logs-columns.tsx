import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { SupportLogsActions } from '../components/SupportLogs/SupportLogsActions';

export const useSupportLogsColumns = () => {
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'user_name',
        header: 'User Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'institute_name',
        header: 'School Name',
      },
      {
        accessorKey: 'role_name',
        header: 'Role',
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => <SupportLogsActions row={row} />,
      },
    ],
    []
  );

  return columns;
};
