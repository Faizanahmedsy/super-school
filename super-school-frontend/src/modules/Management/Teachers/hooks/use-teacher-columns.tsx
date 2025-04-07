import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import useDynamicColumns from '@/hooks/table/useDynamicColumns';
import { TeacherResponse } from '@/services/types/payload';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useMemo } from 'react';
import { TeacherActionsCell } from '../components/teacher-column';

const formatDivisionSubjects = (divisionSubjects: { grade: any; division: any }[]) =>
  divisionSubjects.length === 0
    ? '-'
    : divisionSubjects.map((item) => `${item.grade?.grade_number}${item.division.name}`).join(', ');

export const useTeacherColumns = ({
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
  const columns = useMemo<ColumnDef<TeacherResponse>[]>(
    () => [
      {
        accessorKey: 'profile_image',
        header: '',
        cell: (info) => <ProfileImageAvatar info={info} />,
      },
      {
        accessorKey: 'first_name',
        header: () => {
          return (
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
          );
        },
      },
      {
        accessorKey: 'last_name',
        header: () => {
          return (
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
          );
        },
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
        accessorKey: 'gender',
        header: 'Gender',
        cell: (info) => {
          if (capitalizeFirstLetter(info.row.original.gender)) {
            return capitalizeFirstLetter(info.row.original.gender);
          } else {
            return '-';
          }
        },
      },
      {
        accessorKey: 'masterSubjectIds',
        header: 'Subjects',
        cell: (info) => {
          const subjects = info.row.original.masterSubjectIds;
          return subjects && subjects.length
            ? subjects
                .map(capitalizeFirstLetter)
                .join(', ')
                .split(', ')
                .map((subject: any, index: number) => (
                  <span key={index}>
                    {subject},{index < subjects.length - 1 && <br />}
                  </span>
                ))
            : '-';
        },
      },
      {
        header: 'Grade & Class',
        cell: ({ row }: { row: any }) => <div>{formatDivisionSubjects(row.original.divisionSubjects)}</div>,
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: (info) => <TeacherActionsCell info={info} />,
      },
    ],
    [setPageQuery, capitalizeFirstLetter]
  );

  return useDynamicColumns(columns, restrictedKeys);
};
