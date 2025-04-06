import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { QueryParams } from '@/services/types/params';
import React from 'react';

import { useDoeList } from '@/services/doe/doe.hook';
import { debounce, isArray } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { departmentofeducationcolumn } from './departmentofeducation-column';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';

export default function DepartmentOfEducationTable() {
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = React.useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  const doeListQuery = useDoeList({
    ...pageQuery,
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
    navigate(`/department-admin/detail/${id}`);
  };

  const showEditButton = usePermission(MODULE.DEPARTMENT_OF_EDUCATION, ACTION.EDIT);
  const showDeleteButton = usePermission(MODULE.DEPARTMENT_OF_EDUCATION, ACTION.DELETE);
  if (!showEditButton && !showDeleteButton) {
    departmentofeducationcolumn.pop();
  }
  return (
    <div>
      <DynamicTable
        searchColumn="name"
        searchPlaceholder="Search by Name"
        moduleName={'Total'}
        data={isArray(doeListQuery?.data?.department_users?.list) ? doeListQuery?.data?.department_users?.list : []}
        columns={departmentofeducationcolumn}
        totalCount={doeListQuery.data?.department_users?.totalCount || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        onPaginationChange={handlePaginationChange}
        handleRowClick={handleRowClick}
        loading={doeListQuery.isLoading}
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
