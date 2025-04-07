import { useListOption } from '@/hooks/use-select-option';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { formatTerm } from '@/lib/common-functions';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import useGlobalState from '@/store';
import { useState } from 'react';
import { useSubjectList } from '../Master/subject/subject.action';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import UIText from '@/components/global/Text/UIText';

export const useSelectFilters = () => {
  const cur_batch_id = useRoleBasedCurrentBatch();
  const school_id = useRoleBasedSchoolId();
  const user = useGlobalState((state: any) => state.user);
  const [selectedFilters, setSelectedFilters] = useState({
    school: undefined,
    batch: cur_batch_id,
    term: undefined,
    grade: undefined,
    class: undefined,
    subject: undefined,
  });

  const [searchColumn, setSearchColumn] = useState('Teacher Name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
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
    batch_id: selectedFilters.batch,
    school_id: selectedFilters.school ? selectedFilters.school : school_id,
  });
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  const { data: classListQuery } = useDivisionList(
    {
      sort: 'asc',
      grade_id: selectedFilters.grade,
      batch_id: selectedFilters.batch || cur_batch_id,
      school_id: selectedFilters.school ? selectedFilters.school : school_id,
    },
    Boolean(selectedFilters.grade)
  );
  const { options: classOptions } = useListOption({
    listData: classListQuery?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  const { data: termListQuery } = useTermList({
    sort: 'asc',
    batch_id: selectedFilters.batch || cur_batch_id,
    school_id: selectedFilters.school ? selectedFilters.school : school_id,
  });
  const { options: termOptions } = useListOption({
    listData: termListQuery?.list,
    labelKey: 'term_name',
    valueKey: 'id',
  });

  const { data: subjectData } = useSubjectList(
    {
      grade_id: selectedFilters.grade,
      batch_id: selectedFilters.batch || cur_batch_id,
      term_id: selectedFilters.term,
      school_id: selectedFilters.school ? selectedFilters.school : school_id,
    },
    Boolean(selectedFilters.grade)
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
                    setSelectedFilters((prev) => ({
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
      value: selectedFilters.batch || cur_batch_id?.toString(),
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
    },
    {
      key: 'term',
      placeholder: (
        <>
          <UIText>Filter by Term</UIText>
        </>
      ),
      options: termOptions.map((term) => ({
        label: formatTerm(term.label),
        value: term.value,
      })),
      onSelectChange: (value: string) => handleFilterChange('term', value),
    },
    {
      key: 'class',
      placeholder: (
        <>
          <UIText>Filter by Class</UIText>
        </>
      ),
      options: classOptions,
      onSelectChange: (value: string) => handleFilterChange('class', value),
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
      width: 'lg:w-[350px]',
    },
  ];

  const handleSearchColumnChange = (columnName: string) => {
    setSearchColumn(columnName);
  };

  return { selectFilters, selectedFilters, searchColumn, searchQuery, handleSearchChange, handleSearchColumnChange };
};
