import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import useDynamicColumns from '@/hooks/table/useDynamicColumns';
import { StudentResponse } from '@/services/types/payload';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useMemo } from 'react';
import StudentActionsCell from '../components/list/students-column';

export const useStudentColumns = ({
  pageQuery,
  setPageQuery,
  capitalizeFirstLetter,
  showEditButton,
  showDeleteButton,
  restrictedKeys,
}: {
  pageQuery: any;
  setPageQuery: Function;
  capitalizeFirstLetter: Function;
  showEditButton: boolean;
  showDeleteButton: boolean;
  restrictedKeys: string[];
}) => {
  const columns = useMemo<ColumnDef<StudentResponse>[]>(
    () => [
      {
        accessorKey: 'profile_image',
        header: '',
        cell: (info) => <ProfileImageAvatar info={info} />,
      },
      {
        accessorKey: 'first_name',
        header: () => (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                sort: pageQuery.sort === 'asc' ? 'desc' : 'asc',
                sortField: 'first_name',
              });
            }}
          >
            Name
            <ArrowUpDown size={14} />
          </div>
        ),
      },
      {
        accessorKey: 'last_name',
        header: () => (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                sort: pageQuery.sort === 'asc' ? 'desc' : 'asc',
                sortField: 'last_name',
              });
            }}
          >
            Surname
            <ArrowUpDown size={14} />
          </div>
        ),
      },
      {
        accessorKey: 'addmission_no',
        header: () => (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                sort: pageQuery.sort === 'asc' ? 'desc' : 'asc',
                sortField: 'addmission_no',
              });
            }}
          >
            Admission Number
            <ArrowUpDown size={14} />
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'mobile_number',
        header: 'Mobile Number',
      },
      {
        header: 'Parents',
        cell: ({ row }) => (
          <div>
            {row.original?.parents?.length > 0
              ? row.original.parents.map((parent, index) => (
                  <p key={`${parent.first_name}-${parent.last_name}`}>
                    {parent.first_name} {parent.last_name}
                    {index !== row.original.parents.length - 1 ? ',' : ''}
                  </p>
                ))
              : '-'}
          </div>
        ),
      },
      {
        header: 'Grade',
        cell: ({ row }) => <div>{row.original?.grade?.grade_number || '-'}</div>,
      },
      {
        header: 'Class',
        cell: ({ row }) => <div>{row.original?.division?.name || '-'}</div>,
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: (info) => <StudentActionsCell info={info} />,
      },
    ],
    [setPageQuery, capitalizeFirstLetter]
  );

  return useDynamicColumns(columns, restrictedKeys);
};
