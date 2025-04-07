import useIsFilterApplied from '@/hooks/use-Is-filter-applied';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';

import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useSubjectList } from '@/modules/Master/subject/subject.action';

import { useBatchList } from '@/services/assessments/assessments.hook';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { useState } from 'react';
import UIText from '@/components/global/Text/UIText';

export const useSelectFiltersStudyMaterials = () => {
  const cur_batch_id = useRoleBasedCurrentBatch();
  const school_id = useRoleBasedSchoolId();
  const user = useGlobalState((state: any) => state.user);
  const isFilterApplied = useIsFilterApplied();
  const filterData = useGlobalState((state) => state.filterData);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    school: undefined,
    batch: undefined,
    grade: undefined,
    term: undefined,
    subject: undefined,
  });

  const [searchColumn, setSearchColumn] = useState('Teacher Name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const instituteQuery = useInstituteList(
    {
      sort: 'asc',
      school_id: school_id,
    },
    Boolean(user?.role_name === String(ROLE_NAME.SUPER_ADMIN))
  );

  const { options: instituteOptions } = useListOption({
    listData: instituteQuery?.data?.list || [],
    labelKey: 'school_name',
    valueKey: 'id',
  });

  const { data: batchListQuery } = useBatchList({
    sort: 'asc',
    school_id: selectedFilters.school ? selectedFilters.school : school_id,
  });
  const { options: batchOptions } = useListOption({
    listData: batchListQuery?.list,
    labelKey: 'start_year',
    valueKey: 'id',
  });

  const { data: gradeListQuery } = useGradeList({
    sort: 'asc',
    batch_id: selectedFilters.batch ? selectedFilters.batch : cur_batch_id,
  });
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  const gradeId = user.role_name !== ROLE_NAME.STUDENT ? selectedFilters.grade : user?.details?.grade_id;

  const { data: subjectData } = useSubjectList(
    {
      grade_id: gradeId,
      batch_id: selectedFilters.batch ? selectedFilters.batch : cur_batch_id,
      term_id: selectedFilters.term,
      school_id: selectedFilters.school ? selectedFilters.school : school_id,
    },
    Boolean(gradeId)
  );

  const subjectList =
    subjectData?.subjects.map((subject: any) => ({
      label: subject?.master_subject?.subject_name,
      value: subject?.id,
    })) || [];

  const { options: subjectOptions } = useListOption({
    listData: subjectList,
    labelKey: 'label',
    valueKey: 'value',
  });

  const selectFilters = [
    ...(user.role_name == ROLE_NAME.SUPER_ADMIN
      ? [
          {
            key: 'id',
            placeholder: 'Filter by School',
            options: instituteOptions,
            onSelectChange: (value: string) => {
              handleFilterChange('school', value);

              // Logic to update batch based on selected institute
              instituteQuery?.data?.list.forEach((item: any) => {
                if (item.id == value) {
                  if (item.setup) {
                    const curBatchId = item?.cur_batch?.id;
                    setSelectedFilters((prev: any) => ({
                      ...prev,
                      batch: curBatchId,
                    }));
                    handleFilterChange('batch', curBatchId);
                  }
                }
              });
            },
            defaultValue: school_id,
          },
        ]
      : []),
    {
      key: 'batch',
      placeholder: (
        <>
          <UIText>Filter by Year</UIText>
        </>
      ),
      options: batchListQuery?.isLoading ? [{ label: 'Loading...', value: '' }] : batchOptions,
      onSelectChange: (value: string) => handleFilterChange('batch', value),
      defaultValue: cur_batch_id?.toString(),
      allowClear: false,
    },
    {
      key: 'grade',
      placeholder: (
        <>
          <UIText>Filter by Grade</UIText>
        </>
      ),
      options: gradeOptions,
      onSelectChange: (value: string) => handleFilterChange('grade', value),
      defaultValue: isFilterApplied.grade ? filterData?.grade?.id : undefined,
    },
    {
      key: 'subject',
      placeholder: (
        <>
          <UIText>Filter by Subject</UIText>
        </>
      ),
      options: subjectOptions,
      onSelectChange: (value: string) => handleFilterChange('subject', value),
      defaultValue: isFilterApplied.subject ? filterData?.subject?.id : undefined,
      width: 'lg:w-[350px]',
    },
  ];

  const handleSearchColumnChange = (columnName: string) => {
    setSearchColumn(columnName);
  };

  return {
    selectFilters,
    selectedFilters,
    searchColumn,
    searchQuery,
    handleSearchChange,
    handleSearchColumnChange,
    setSelectedFilters,
  };
};
