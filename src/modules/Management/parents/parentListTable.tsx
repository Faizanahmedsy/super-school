import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import useFilteredColumns from '@/hooks/table/useFilteredColumns';
import { useParentList } from '@/services/management/parent/parent.hook';
import { QueryParams } from '@/services/types/params';
import { ParentResponse } from '@/services/types/payload';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { ArrowUpDown } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParentActionsCell from './parent-column';
import UIText from '@/components/global/Text/UIText';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';

export default function ParentListTable() {
  const navigate = useNavigate();
  const user = useGlobalState((state) => state.user);
  const [pageQuery, setPageQuery] = React.useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  const [selectedFilter, setSelectedFilter] = React.useState<string>();

  const masterSchool = useGlobalState((state) => state.masterSchool);

  const parentListQuery = useParentList({
    ...pageQuery,
    school_id: masterSchool?.id || undefined,
    city_id: selectedFilter || undefined,
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery({
      ...pageQuery,
      page: pageIndex + 1,
      limit: pageSize,
    });
  };
  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300); // adjust delay as needed

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };
  const handleRowClick = (id: number) => {
    if (user.role_name != ROLE_NAME.TEACHER) {
      navigate(`/parent/detail/${id}`);
    }
  };

  const parentColumns: ColumnDef<ParentResponse>[] = [
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
              });
            }}
          >
            <UIText>Name</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
    },
    {
      accessorKey: 'last_name',
      header: 'Surname',
    },

    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'mobile_number',
      header: 'Mobile Number',
      cell: (info) => info.getValue(),
    },
    {
      header: 'Children',
      cell: (info: any) => {
        return (
          <div>
            {info.row.original?.students && info.row.original.students.length > 0 ? (
              info.row.original.students.map((student: { first_name: string; last_name: string }, index: number) => (
                <p key={`${student.first_name}-${student.last_name}`}>
                  {student.first_name} {student.last_name}
                  {index !== info.row.original.students.length - 1 ? ',' : ''}
                </p>
              ))
            ) : (
              <p>-</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (info) => <ParentActionsCell info={info} />,
    },
  ];
  const showEditButton = usePermission(MODULE.PARENTS, ACTION.EDIT);
  const showDeleteButton = usePermission(MODULE.PARENTS, ACTION.DELETE);
  if (!showEditButton && !showDeleteButton) {
    parentColumns.pop();
  }

  const restrictedKeys = ['email', 'mobile_number'];

  const filteredParentsColumns = useFilteredColumns(parentColumns, restrictedKeys);

  return (
    <div>
      <DynamicTable
        searchColumn="name"
        searchPlaceholder="Search by Name"
        moduleName={'Parents'}
        data={parentListQuery.data?.list}
        columns={filteredParentsColumns}
        totalCount={parentListQuery.data?.totalCount || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        onPaginationChange={handlePaginationChange}
        handleRowClick={handleRowClick}
        loading={parentListQuery.isLoading}
        onSearchChange={handleSearchInputChange}
        // selectFilters={[
        //   {
        //     key: 'state',
        //     placeholder: 'Filter by Province',
        //     options: selectOptions,
        //     onSelectChange: handleSelectChange,
        //   },
        // ]}
      />
    </div>
  );
}
