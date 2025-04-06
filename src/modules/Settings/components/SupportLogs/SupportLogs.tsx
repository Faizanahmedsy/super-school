import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useTableFiltersV1 } from '@/hooks/table/use-table-filter-v1';
import { useFetchReportList } from '@/modules/HelpAndSupport/action/help-and-support.action';
import { useNavigate } from 'react-router-dom';
import { useSupportLogsColumns } from '../../hooks/use-support-logs-columns';
import { useState } from 'react';
import { useSupportLogTableFilters } from '../../hooks/use-support-log-table-filters';

export default function SupportLogs() {
  const navigate = useNavigate();
  const [selectedSchool, setSelectedSchool] = useState<any>({});

  const { pageQuery, setPageQuery, selectFilters, handlePaginationChange, handleSearchChange, selectedFilters } =
    useSupportLogTableFilters({
      enableSchoolFilter: true,
      onFiltersChange: (filters) => {
        setSelectedSchool(filters.school);
      },
    });
  const supportLogsList = useFetchReportList({
    ...pageQuery,
  });

  const columns = useSupportLogsColumns();

  return (
    <>
      <DynamicTable
        searchColumn="name"
        searchPlaceholder="Search by Email"
        data={supportLogsList?.data?.list || []}
        columns={columns}
        totalCount={supportLogsList?.data?.totalCount || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        loading={supportLogsList.isLoading}
        onSearchChange={handleSearchChange}
        onPaginationChange={handlePaginationChange}
        selectFilters={selectFilters}
      />
    </>
  );
}
