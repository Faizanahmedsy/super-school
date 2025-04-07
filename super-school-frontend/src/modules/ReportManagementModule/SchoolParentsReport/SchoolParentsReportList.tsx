import AppsContainer from '@/app/components/AppsContainer';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useSchoolParentsReportList } from '@/services/reportmanagement/schoolreport.hook';
import { QueryParams } from '@/services/types/params';
import { useState } from 'react';
import { useSelectFilters } from '../GlobalFilterOnlyReportModule';
import { schoolParentsReportColumns } from './schoolparentsreport.column';
import useFilteredColumns from '@/hooks/table/useFilteredColumns';
import DownloadExcelBtn from '@/components/global/DownloadExcel/DownloadExcelBtn';

const SchoolParentsReportList = () => {
  const { selectFilters, selectedFilters, searchColumn, searchQuery, handleSearchChange } = useSelectFilters();
  const school_id = useRoleBasedSchoolId();
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
  });
  const { data: schoolParentsReportList, isLoading } = useSchoolParentsReportList({
    ...pageQuery,
    school_id: selectedFilters.school ? selectedFilters.school : school_id,
    search: searchQuery,
    batch_id: selectedFilters.batch,
    term: selectedFilters.term,
    grade: selectedFilters.grade,
    grade_class: selectedFilters.class,
    subject_id: selectedFilters.subject,
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };

  const restrictedKeys = ['parent_email', 'parent_mobile'];
  const schoolParentsReportcolumns = useFilteredColumns(schoolParentsReportColumns, restrictedKeys);

  const filters: any = selectFilters.filter((item) => item.key !== 'term' && item.key !== 'subject');

  return (
    <>
      <div className="flex justify-end items-center">
        <DownloadExcelBtn
          apiEndPoint={`reports/school-parents-report/?${[
            selectedFilters?.batch ? `batch_id=${selectedFilters.batch}` : '',
            selectedFilters.school ? `school_id=${selectedFilters.school}` : `school_id=${school_id}`,
            searchQuery ? `search=${searchQuery}` : '',
            selectedFilters.term ? `term=${selectedFilters.term}` : '',
            selectedFilters.grade ? `grade=${selectedFilters.grade}` : '',
            selectedFilters.class ? `grade_class=${selectedFilters.class}` : '',
            selectedFilters.subject ? `subject_id=${selectedFilters.subject}` : '',
            'download=true',
          ]
            .filter(Boolean)
            .join('&')}`}
          fileName={'parents_report'}
        />
      </div>
      <AppsContainer fullView={true}>
        <DynamicTable
          data={Array.isArray(schoolParentsReportList?.results) ? schoolParentsReportList?.results || [] : []}
          columns={schoolParentsReportcolumns}
          loading={isLoading}
          totalCount={schoolParentsReportList?.totalCount || 0}
          pageSize={pageQuery.page_size}
          pageIndex={(pageQuery.page ?? 1) - 1}
          onPaginationChange={handlePaginationChange}
          selectFilters={filters}
          searchPlaceholder="Search by Parents Name / Email"
          searchColumn={searchColumn}
          onSearchChange={handleSearchChange}
        />
      </AppsContainer>
    </>
  );
};

export default SchoolParentsReportList;
