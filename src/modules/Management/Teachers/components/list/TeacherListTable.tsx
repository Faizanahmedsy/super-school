import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useTableFiltersV1 } from '@/hooks/table/use-table-filter-v1';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useTeachereList } from '@/services/management/teacher/teacher.hook';
import useGlobalState from '@/store';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestrictedColumns } from '../../helper/teacher.utils';
import { useTeacherColumns } from '../../hooks/use-teacher-columns';
export default function TeacherListTable() {
  // HOOKS
  const navigate = useNavigate();
  const showEditButton = usePermission(MODULE.TEACHERS, ACTION.EDIT);
  const showDeleteButton = usePermission(MODULE.TEACHERS, ACTION.DELETE);

  const { pageQuery, setPageQuery, selectFilters, handlePaginationChange, handleSearchChange, selectedFilters } =
    useTableFiltersV1({
      enableBatchFilter: true,
      onFiltersChange: (filters) => {},
    });

  // GLOBAL STATE
  const user = useGlobalState((state) => state.user);
  const schoolId = useRoleBasedSchoolId();
  const masterBatchId: any = useRoleBasedCurrentBatch();

  // LOCAL STATE
  const [selectYear, setSelectYear] = useState(masterBatchId);
  const [selectedCity] = React.useState<string>();
  const [selectedState] = React.useState<string>();

  // QUERIES
  const teacherListQuery = useTeachereList({
    ...pageQuery,
    school_id: schoolId || undefined,
    batch_id: selectedFilters.batch,
    city_id: selectedCity || undefined,
    state_id: selectedState || undefined,
  });

  //EFFECTS
  useEffect(() => {
    setPageQuery({
      ...pageQuery,
      page: 1,
      batch_id: masterBatchId,
    });
  }, [masterBatchId, selectYear]);

  // UTILS
  const restrictedKeys = getRestrictedColumns(user?.role_name, showEditButton, showDeleteButton);
  const filteredTeacherColumns = useTeacherColumns({
    pageQuery,
    setPageQuery,
    capitalizeFirstLetter,
    showEditButton,
    showDeleteButton,
    restrictedKeys,
  });

  const handleRowClick = (id: number, data: any) => {
    if (
      user.role_name === ROLE_NAME.ADMIN ||
      user.role_name === ROLE_NAME.SUPER_ADMIN ||
      user.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION ||
      user.role_name === ROLE_NAME.STUDENT ||
      user.role_name === ROLE_NAME.PARENT ||
      (user.role_name == ROLE_NAME.TEACHER && user?.details?.id == data?.id)
    ) {
      navigate(`/teacher/detail/${id}`);
    }
  };

  return (
    <>
      <DynamicTable
        searchColumn="name"
        searchPlaceholder="Search by Name"
        data={teacherListQuery.data?.list || []}
        columns={filteredTeacherColumns}
        totalCount={teacherListQuery.data?.totalCount || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        moduleName={'Teachers'}
        loading={teacherListQuery.isLoading}
        handleRowClick={handleRowClick}
        onSearchChange={handleSearchChange}
        onPaginationChange={handlePaginationChange}
        selectFilters={selectFilters}
      />
    </>
  );
}
