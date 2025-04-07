// hooks/useTableFilters.ts
import { useState, useEffect } from 'react';
import useGlobalState from '@/store';
import { QueryParams } from '@/services/types/params';
import { useListOption } from '@/hooks/use-select-option';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

export type FilterConfig = {
  enableSchoolFilter?: boolean;
  initialFilters?: {
    school?: string;
  };
  onFiltersChange?: (filters: any) => void;
  ordering?: string;
};

export const useSupportLogTableFilters = (config: FilterConfig = {}) => {
  const school_id = useRoleBasedSchoolId();
  const user = useGlobalState((state) => state.user);

  // Local state for school filter
  const [schoolSelectedFilter, setSchoolSelectedFilter] = useState<string | undefined>(undefined);

  // Page query state
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    school_id: school_id,
    sort: config?.ordering === 'asc' || config?.ordering === 'desc' ? config.ordering : 'desc',
  });

  // Fetch school options
  const schoolListQuery = useInstituteList(
    {
      sort: 'asc',
    },
    Boolean(user?.role_name === ROLE_NAME.SUPER_ADMIN)
  );

  // Convert school data to options
  const { options: schoolOptions } = useListOption({
    listData: schoolListQuery?.data?.list ?? [],
    labelKey: 'school_name',
    valueKey: 'id',
  });

  // Handle school filter change
  const handleSchoolSelectChange = (value: string) => {
    setPageQuery((prev) => ({
      ...prev,
      page: 1,
      school_id: value,
    }));
    setSchoolSelectedFilter(value);
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
      school: schoolSelectedFilter,
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
  const debouncedSearch = (searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      page: 1,
      search: searchTerm,
    }));
  };

  // Generate select filters configuration
  const getSelectFilters = () => {
    const filters = [];

    if (config.enableSchoolFilter) {
      filters.push({
        key: 'school',
        placeholder: 'Filter by School',
        options: schoolOptions,
        onSelectChange: handleSchoolSelectChange,
        defaultValue: school_id,
        isDisabled: true,
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
      school: schoolSelectedFilter,
    },
    resetFilters: () => {
      setSchoolSelectedFilter(undefined);
      resetPagination();
      notifyFiltersChanged();
    },
  };
};
