import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import UIText from '@/components/global/Text/UIText';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useParentStudentList, useStudentList } from '@/services/management/students/students.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { debounce } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentColumns } from '../../hooks/use-student-columns';

export default function StudentsListTable() {
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = React.useState<QueryParams>({
    page: 1,
    limit: 10,
    sort: 'desc',
  });

  const [selectedFilter, setSelectedFilter] = React.useState<string>();
  const user = useGlobalState((state) => state.user);
  const schoolId = useRoleBasedSchoolId();
  const curBatchId = useRoleBasedCurrentBatch();

  const cur_batch_id: any = curBatchId ? curBatchId : user?.cur_batch?.id?.toString();
  const [selectYear, setSelectYear] = React.useState<string>(cur_batch_id);

  const parentStudentsListQuery = useParentStudentList(
    {
      ...pageQuery,
      grade_id: user?.details?.grade?.id || undefined,
      batch_id: curBatchId || undefined,
    },
    Boolean(user?.role_name == ROLE_NAME.PARENT ? true : false)
  );

  const studentsListQuery = useStudentList(
    {
      ...pageQuery,
      school_id: schoolId,
      grade_id: selectedFilter || undefined,
      batch_id: selectYear || undefined,
    },
    Boolean(user?.role_name != ROLE_NAME.PARENT ? true : false)
  );

  const selectedStudentsListQuery = user?.role_name == ROLE_NAME.PARENT ? parentStudentsListQuery : studentsListQuery;
  const { data: yearData } = useBatchList({
    sort: 'asc',
    school_id: schoolId,
  });

  const { data: gradeListQuery } = useGradeList({
    sort: 'asc',
    batch_id: curBatchId,
    school_id: schoolId,
  });

  const { options } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });
  let batchList = useListOption({
    listData: yearData?.list,
    labelKey: 'start_year',
    valueKey: 'id',
  });
  const yearListOptions = batchList?.options ? batchList?.options : [];

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery({
      ...pageQuery,
      page: pageIndex + 1,
      limit: pageSize,
    });
  };

  const handleSelectChange = (value: string) => {
    setSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };
  const handleSelectYear = (value: string) => {
    setSelectYear(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
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
  const handleRowClick = (id: number, data: any) => {
    navigate(`/learner/detail/${id}?std_id=${data?.student_user_id}`);
  };

  const restrictedKeys = ['email', 'mobile_number'];
  const showEditButton = usePermission(MODULE.PARENTS, ACTION.EDIT);
  const showDeleteButton = usePermission(MODULE.PARENTS, ACTION.DELETE);
  if (!showEditButton && !showDeleteButton) {
    restrictedKeys.push('actions');
  }
  const studentColumns = useStudentColumns({
    pageQuery,
    setPageQuery,
    capitalizeFirstLetter: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
    showEditButton: true,
    showDeleteButton: true,
    restrictedKeys,
  });

  return (
    <div>
      <DynamicTable
        searchColumn="name"
        searchPlaceholder="Search by Name & addmission number"
        data={selectedStudentsListQuery.data?.list}
        columns={studentColumns}
        totalCount={selectedStudentsListQuery.data?.totalCount || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        onPaginationChange={handlePaginationChange}
        loading={selectedStudentsListQuery.isLoading}
        onSearchChange={handleSearchInputChange}
        moduleName={'Learners'}
        handleRowClick={handleRowClick}
        selectFilters={[
          ...(user?.role_name == ROLE_NAME.PARENT
            ? []
            : [
                {
                  key: 'year',
                  placeholder: (
                    <>
                      <UIText>Filter by Year</UIText>
                    </>
                  ),
                  options: yearListOptions,
                  onSelectChange: handleSelectYear,
                  defaultValue: curBatchId,
                },
              ]),
          {
            key: 'state',
            placeholder: 'Filter by Grade',
            options: options,
            onSelectChange: handleSelectChange,
          },
        ]}
      />
    </div>
  );
}
