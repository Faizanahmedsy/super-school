import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useListOption } from '@/hooks/use-select-option';
import { useCityList } from '@/services/city/city.hook';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { useStateList } from '@/services/state/state.hook';
import { QueryParams } from '@/services/types/params';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { instituteColumns } from './columns';
import { useNavigate } from 'react-router-dom';
import UIText from '@/components/global/Text/UIText';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';

export default function InstituteListTable() {
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    sort: 'desc',
  });

  const [selectedCity, setSelectedCity] = React.useState<string>();
  const [selectedState, setSelectedState] = React.useState<string>();

  const instituteListQuery = useInstituteList({
    ...pageQuery,
    district_id: selectedCity || undefined,
    province_id: selectedState || undefined,
  });

  const stateQuery = useStateList({});

  const cityQuery = useCityList({
    state_id: selectedState,
  });

  const { options: cityOptions } = useListOption({
    listData: cityQuery?.data,
    labelKey: 'district_name',
    valueKey: 'id',
  });

  const { options: stateOption } = useListOption({
    listData: stateQuery?.data,
    labelKey: 'province_name',
    valueKey: 'id',
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const handleCitySelectChange = (value: string) => {
    setSelectedCity(value);
    setPageQuery((prev) => ({
      ...prev,
      page: 1,
      // district_id: value,
    }));
  };

  const handleStateSelectChange = (value: string) => {
    setSelectedState(value);
    setPageQuery((prev) => ({
      ...prev,
      page: 1,
      // province_id: value,
    }));
  };

  // Debounced search handler
  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300); // adjust delay as needed

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  useEffect(() => {
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleRowClick = (id: number) => {
    navigate(`/institute/detail/${id}`);
  };
  const showEditButton = usePermission(MODULE.PARENTS, ACTION.EDIT);
  const showDeleteButton = usePermission(MODULE.PARENTS, ACTION.DELETE);
  if (!showEditButton && !showDeleteButton) {
    instituteColumns.pop();
  }
  return (
    <div>
      <DynamicTable
        onSearchChange={handleSearchInputChange}
        data={instituteListQuery.data?.list || []}
        columns={instituteColumns}
        moduleName={'Schools'}
        totalCount={instituteListQuery.data?.totalCount || 0}
        searchColumn="school_name"
        searchPlaceholder="Search by School Name / EMIS Number"
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        loading={instituteListQuery.isLoading}
        onPaginationChange={handlePaginationChange}
        handleRowClick={handleRowClick}
        selectFilters={[
          {
            key: 'state',
            placeholder: (
              <>
                <UIText>Filter by Province</UIText>
              </>
            ),
            options: stateOption,
            onSelectChange: handleStateSelectChange,
          },
          {
            key: 'city',
            placeholder: (
              <>
                <UIText>Filter by District</UIText>
              </>
            ),
            options: cityOptions,
            onSelectChange: handleCitySelectChange,
          },
        ]}
      />
    </div>
  );
}
