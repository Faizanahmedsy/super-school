import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import { useAdminList } from '@/services/master/admin/admin.hook';
import { QueryParams } from '@/services/types/params';
import { AdminResponse } from '@/services/types/payload';
import { ColumnDef } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { ArrowUpDown } from 'lucide-react';
import React, { useEffect } from 'react';
import AdminActionsCell from './admin-column';

export default function AdminListTable() {
  // GLOBAL STATEs
  const schoolId = useRoleBasedSchoolId();

  // LOCAL STATEs
  const [pageQuery, setPageQuery] = React.useState<QueryParams>({
    page: 1,
    limit: 10,
    sort: 'desc',
    sortField: 'created_at',
  });

  // QUERIES
  const adminListQuery = useAdminList({
    ...pageQuery,
    school_id: schoolId as string,
  });

  // HANDLERS
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  const adminColumns: ColumnDef<AdminResponse>[] = [
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
      header: 'School',
      cell: (info) => <div>{info.row.original?.institute?.school_name}</div>,
    },
    // {
    //   header: 'EMIS Number',
    //   cell: (info) => <div>{info.row.original?.institute?.EMIS_number}</div>,
    // },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'mobile_number',
      header: 'Mobile Number',
      cell: (info) => <RenderNullableValue value={info.row.original?.mobile_number} />,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: (info) => {
        if (!info.row.original?.gender) {
          return '-';
        }

        return info.row.original?.gender?.charAt(0).toUpperCase() + info.row.original?.gender?.slice(1)?.toLowerCase();
      },
    },
    {
      header: 'Actions',
      cell: (info: any) => <AdminActionsCell info={info} />,
    },
  ];

  const showEditButton = usePermission(MODULE.ADMIN, ACTION.EDIT);
  const showDeleteButton = usePermission(MODULE.ADMIN, ACTION.DELETE);
  if (!showEditButton && !showDeleteButton) {
    adminColumns.pop();
  }

  // EFFECTS
  useEffect(() => {
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  return (
    <div>
      <DynamicTable
        onSearchChange={handleSearchInputChange}
        data={adminListQuery?.data?.list || []}
        columns={adminColumns}
        loading={adminListQuery.isLoading}
        searchColumn="school"
        searchPlaceholder="Search by Name"
        moduleName="Admins"
        totalCount={adminListQuery.data?.totalCount || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}
