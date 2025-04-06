// hooks/useTableFilters.ts
import { useState, useEffect } from 'react';
import useGlobalState from '@/store';
import { QueryParams } from '@/services/types/params';
import { useListOption } from '@/hooks/use-select-option';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { debounce } from 'lodash';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useRoleBasedCurrentBatch } from '../role-based-ids/use-rolebased-currentbatch';

export type FilterConfig = {
  enableTermFilter?: boolean;
  enableGradeFilter?: boolean;
  enableClassFilter?: boolean;
  enableBatchFilter?: boolean;
  enableSubjectFilter?: boolean;
  enableSchoolFilter?: boolean;
  initialFilters?: {
    term?: string;
    grade?: string;
    class?: string;
    batch?: string;
    subject?: string;
  };
  onFiltersChange?: (filters: any) => void;
  ordering?: string;
};

export const useTableFiltersV1 = (config: FilterConfig = {}) => {
  const school_id = useRoleBasedSchoolId();
  const filterData = useGlobalState((state) => state.filterData);
  const user = useGlobalState((state) => state.user);
  const cur_batch_id = useRoleBasedCurrentBatch();

  // Local states for filters
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined);
  const [selectedYearFilter, setYearSelectedFilter] = useState<string | undefined>(cur_batch_id?.toString());
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
    school_id: config.enableSchoolFilter && school_id ? school_id : undefined,
    ordering: config?.ordering ? config.ordering : '-created_at',
  });

  // Check if filters are applied
  const isFilterApplied = {
    batch: filterData?.batch?.id && filterData?.batch?.id !== 'null',
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null',
    class: filterData?.class?.id && filterData?.class?.id !== 'null',
    term: filterData?.term?.id && filterData?.term?.id !== 'null',
    subject: filterData?.subject?.id && filterData?.subject?.id !== 'null',
  };

  // Fetch filter options with proper dependencies
  const { data: batchListQuery } = useBatchList({
    sort: 'asc',
    school_id: school_id ? school_id : undefined,
  });

  const { data: gradeListQuery } = useGradeList(
    {
      sort: 'asc',
      batch_id: selectedYearFilter,
      school_id: school_id ? school_id : undefined,
    },
    Boolean(config.enableGradeFilter)
  );

  const { data: termListQuery } = useTermList(
    {
      sort: 'asc',
      batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
      school_id: school_id ? school_id : undefined,
    },
    Boolean(config.enableTermFilter)
  );

  const { data: classListQuery } = useDivisionList(
    {
      sort: 'asc',
      grade_id: selectedFilter,
      batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
      school_id: school_id ? school_id : undefined,
    },
    Boolean(config.enableClassFilter)
  );

  const { data: subjectListQuery } = useSubjectList(
    {
      grade_id: selectedFilter,
      batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
      term_id: selectedTermFilter,
      school_id: school_id ? school_id : undefined,
    },
    Boolean(config.enableSubjectFilter)
  );

  const schoolListQuery = useInstituteList(
    {
      sort: 'asc',
    },
    Boolean(user?.role_name === ROLE_NAME.SUPER_ADMIN)
  );

  // Convert data to options
  const { options: schoolOptions } = useListOption({
    listData: schoolListQuery?.data?.list ?? [],
    labelKey: 'school_name',
    valueKey: 'id',
  });

  const { options: batchOptions } = useListOption({
    listData: batchListQuery?.list ?? [],
    labelKey: 'start_year',
    valueKey: 'id',
  });

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

  // Create properly formatted subject options
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
    if (isFilterApplied.batch && filterData) {
      setYearSelectedFilter(filterData.batch?.id);
    }
    if (isFilterApplied.subject && filterData) {
      setSubjectSelectedFilter(filterData.subject?.id);
    }
  }, [filterData]);

  // Handle filter changes
  const handleBatchSelectChange = (value: string) => {
    setYearSelectedFilter(value);
    // Reset dependent filters
    setSelectedFilter(undefined);
    setTermSelectedFilter(undefined);
    setClassSelectedFilter(undefined);
    setSubjectSelectedFilter(undefined);
    resetPagination();
    notifyFiltersChanged();
  };

  const handleGradeSelectChange = (value: string) => {
    setSelectedFilter(value);
    // Reset dependent filters
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
      batch: selectedYearFilter,
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

    if (config.enableSchoolFilter) {
      filters.push({
        key: 'school',
        placeholder: 'Filter by School',
        options: schoolOptions,
        onSelectChange: () => { },
        defaultValue: school_id,
        isDisabled: true,
      });
    }

    if (config.enableBatchFilter) {
      filters.push({
        key: 'batch',
        placeholder: 'Filter by Year',
        options: batchOptions,
        onSelectChange: handleBatchSelectChange,
        defaultValue: isFilterApplied.batch ? filterData?.batch?.id : cur_batch_id?.toString(),
      });
    }

    if (config.enableTermFilter) {
      filters.push({
        key: 'term',
        placeholder: 'Filter by Term',
        options: termOptions,
        onSelectChange: handleTermSelectChange,
        defaultValue: isFilterApplied.term ? filterData?.term?.id : undefined,
        isDisabled: !selectedYearFilter,
      });
    }

    if (config.enableGradeFilter) {
      filters.push({
        key: 'grade',
        placeholder: 'Filter by Grade',
        options: gradeOptions,
        onSelectChange: handleGradeSelectChange,
        defaultValue: isFilterApplied.grade ? filterData?.grade?.id : undefined,
        isDisabled: !selectedYearFilter,
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
      batch: selectedYearFilter,
      grade: selectedFilter,
      term: selectedTermFilter,
      class: selectedClassFilter,
      subject: selectedSubjectFilter,
    },
    resetFilters: () => {
      setYearSelectedFilter(cur_batch_id?.toString());
      setSelectedFilter(undefined);
      setTermSelectedFilter(undefined);
      setClassSelectedFilter(undefined);
      setSubjectSelectedFilter(undefined);
      resetPagination();
      notifyFiltersChanged();
    },
  };
};
