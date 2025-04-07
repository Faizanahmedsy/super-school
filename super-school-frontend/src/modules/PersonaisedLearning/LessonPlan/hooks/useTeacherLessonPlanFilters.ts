import { useState, useEffect } from 'react';
import { QueryParams } from '@/services/types/params';
import { useListOption } from '@/hooks/use-select-option';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { debounce } from 'lodash';
import useGlobalState from '@/store';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';

export type FilterConfig = {
  enableTermFilter?: boolean;
  enableGradeFilter?: boolean;
  enableClassFilter?: boolean;
  enableSubjectFilter?: boolean;
  initialFilters?: {
    term?: string;
    grade?: string;
    class?: string;
    subject?: string;
  };
  onFiltersChange?: (filters: any) => void;
  ordering?: string;
};

export const useTeacherLessonPlanFilters = (config: FilterConfig = {}) => {
  const filterData = useGlobalState((state) => state.filterData);
  const user = useGlobalState((state) => state.user);
  const batchId = useRoleBasedCurrentBatch();
  const cur_batch_id = batchId;

  // Local states for filters
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined);
  const [selectedTermFilter, setTermSelectedFilter] = useState<string | undefined>(undefined);
  const [selectedClassFilter, setClassSelectedFilter] = useState<string | undefined>(undefined);
  const [selectedSubjectFilter, setSubjectSelectedFilter] = useState<string | undefined>(undefined);

  // Page query state
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    grade: filterData?.grade?.id,
    term: filterData?.term?.id,
    grade_class: filterData?.class?.id,
    subject: filterData?.subject?.id && filterData?.subject?.id !== 'null' ? filterData?.subject?.id : undefined,
    ordering: config?.ordering ? config.ordering : '-created_at',
  });

  // Check if filters are applied
  const isFilterApplied = {
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null',
    class: filterData?.class?.id && filterData?.class?.id !== 'null',
    term: filterData?.term?.id && filterData?.term?.id !== 'null',
    subject: filterData?.subject?.id && filterData?.subject?.id !== 'null',
  };

  // Fetch filter options with proper dependencies
  const { data: gradeListQuery } = useGradeList(
    {
      sort: 'asc',
      batch_id: cur_batch_id,
    },
    Boolean(config.enableGradeFilter)
  );

  const { data: termListQuery } = useTermList(
    {
      sort: 'asc',
      batch_id: cur_batch_id,
    },
    Boolean(config.enableTermFilter)
  );

  const { data: classListQuery } = useDivisionList(
    {
      sort: 'asc',
      grade_id: selectedFilter,
      batch_id: cur_batch_id,
    },
    Boolean(config.enableClassFilter && selectedFilter)
  );

  const { data: subjectListQuery } = useSubjectList(
    {
      grade_id: selectedFilter,
      batch_id: cur_batch_id,
      term_id: selectedTermFilter,
    },
    Boolean(config.enableSubjectFilter && selectedFilter && selectedTermFilter)
  );

  // Convert data to options
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list ?? [],
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  const { options: termOptions } = useListOption({
    listData: termListQuery?.list ?? [],
    labelKey: 'term_name',
    valueKey: 'id',
  });

  const { options: classOptions } = useListOption({
    listData: classListQuery?.list ?? [],
    labelKey: 'name',
    valueKey: 'id',
  });

  const subjectOptions = (subjectListQuery?.subjects ?? []).map((subject: any) => ({
    label: subject?.master_subject?.subject_name,
    value: subject?.id,
  }));

  // Initialize filters from global state
  useEffect(() => {
    if (isFilterApplied.grade && filterData) {
      setSelectedFilter(filterData.grade?.id);
    }
    if (isFilterApplied.class && filterData) {
      setClassSelectedFilter(filterData.class?.id);
    }
    if (isFilterApplied.term && filterData) {
      setTermSelectedFilter(filterData.term?.id);
    }
    if (isFilterApplied.subject && filterData) {
      setSubjectSelectedFilter(filterData.subject?.id);
    }
  }, [filterData]);

  // Handle filter changes
  const handleGradeSelectChange = (value: string) => {
    setSelectedFilter(value);
    setClassSelectedFilter(undefined);
    setSubjectSelectedFilter(undefined);
    resetPagination();
    notifyFiltersChanged();
  };

  const handleTermSelectChange = (value: string) => {
    setTermSelectedFilter(value);
    setSubjectSelectedFilter(undefined);
    resetPagination();
    notifyFiltersChanged();
  };

  const handleClassSelectChange = (value: string) => {
    setClassSelectedFilter(value);
    resetPagination();
    notifyFiltersChanged();
  };

  const handleSubjectSelectChange = (value: string) => {
    setSubjectSelectedFilter(value);
    resetPagination();
    notifyFiltersChanged();
  };

  // Reset pagination
  const resetPagination = () => {
    setPageQuery((prev) => ({ ...prev, page: 1 }));
  };

  // Notify parent component of filter changes
  const notifyFiltersChanged = () => {
    config.onFiltersChange?.({
      grade: selectedFilter,
      term: selectedTermFilter,
      class: selectedClassFilter,
      subject: selectedSubjectFilter,
    });
  };

  // Handle pagination
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  // Handle search with debounce
  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      page: 1,
      search: searchTerm,
    }));
  }, 300);

  // Generate select filters configuration
  const getSelectFilters = () => {
    const filters = [];

    if (config.enableGradeFilter) {
      filters.push({
        key: 'grade',
        placeholder: 'Filter by Grade',
        options: gradeOptions,
        onSelectChange: handleGradeSelectChange,
        defaultValue: isFilterApplied.grade ? filterData?.grade?.id : undefined,
      });
    }

    if (config.enableTermFilter) {
      filters.push({
        key: 'term',
        placeholder: 'Filter by Term',
        options: termOptions,
        onSelectChange: handleTermSelectChange,
        defaultValue: isFilterApplied.term ? filterData?.term?.id : undefined,
      });
    }

    if (config.enableClassFilter) {
      filters.push({
        key: 'class',
        placeholder: 'Filter by Class',
        options: classOptions,
        onSelectChange: handleClassSelectChange,
        defaultValue: isFilterApplied.class ? filterData?.class?.id : undefined,
        isDisabled: !selectedFilter,
      });
    }

    if (config.enableSubjectFilter) {
      filters.push({
        key: 'subject',
        placeholder: 'Filter by Subject',
        options: subjectOptions,
        onSelectChange: handleSubjectSelectChange,
        defaultValue: isFilterApplied.subject ? filterData?.subject?.id : undefined,
        isDisabled: !selectedFilter || !selectedTermFilter,
        width: 'lg:w-[350px]',
      });
    }

    return filters;
  };

  return {
    pageQuery,
    setPageQuery,
    selectFilters: getSelectFilters(),
    handlePaginationChange,
    handleSearchChange: debouncedSearch,
    selectedFilters: {
      grade: selectedFilter,
      term: selectedTermFilter,
      class: selectedClassFilter,
      subject: selectedSubjectFilter,
    },
    resetFilters: () => {
      setSelectedFilter(undefined);
      setTermSelectedFilter(undefined);
      setClassSelectedFilter(undefined);
      setSubjectSelectedFilter(undefined);
      resetPagination();
      notifyFiltersChanged();
    },
  };
};
