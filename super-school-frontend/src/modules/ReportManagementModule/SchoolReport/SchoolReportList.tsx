import AppsContainer from '@/app/components/AppsContainer';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import DownloadExcelBtn from '@/components/global/DownloadExcel/DownloadExcelBtn';
import { useListOption } from '@/hooks/use-select-option';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { useSchoolReportList } from '@/services/reportmanagement/schoolreport.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { useState } from 'react';
import { schoolReportColumns } from './schoolreport.column';
import UIText from '@/components/global/Text/UIText';

const SchoolReportList = () => {
  const user = useGlobalState((state: any) => state.user);
  const [selectedInstituteFilter, setInstituteSelectedFilter] = useState<string>();
  const cur_batch_id = useRoleBasedCurrentBatch();
  const schoolId = useRoleBasedSchoolId();
  const [selectedFilters, setSelectedFilters] = useState<any>({
    batch: cur_batch_id,
  });
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
  });
  const { data: schoolReportList, isLoading } = useSchoolReportList({
    ...pageQuery,
    batch_id: selectedFilters?.batch ? selectedFilters?.batch : cur_batch_id,
    school_id: selectedInstituteFilter ? selectedInstituteFilter : schoolId,
  });
  const school_id = useRoleBasedSchoolId();
  const instituteQuery = useInstituteList({
    sort: 'asc',
    school_id: school_id,
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };

  const handleInstituteSelectChange = (value: string) => {
    // get cur_batch_id from insitute list api based on school id (value)
    instituteQuery?.data?.list.map((item: any) => {
      if (item.id == value) {
        if (item.setup) {
          setSelectedFilters({
            batch: item.cur_batch?.id,
          });
          handleFilterChange('batch', item.cur_batch?.id);
        }
      }
    });
    setInstituteSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };
  const { data: batchListQuery } = useBatchList({
    sort: 'asc',
    school_id: selectedInstituteFilter ? selectedInstituteFilter : school_id,
  });

  const { options: batchOptions } = useListOption({
    listData: batchListQuery?.list,
    labelKey: 'start_year',
    valueKey: 'id',
  });

  const { options: instituteOptions } = useListOption({
    listData: instituteQuery?.data?.list || [],
    labelKey: 'school_name',
    valueKey: 'id',
  });

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const filters = [
    {
      key: 'id',
      placeholder: 'Filter by School',
      options: instituteOptions,
      onSelectChange: handleInstituteSelectChange,
      defaultValue: school_id,
    },
    {
      key: 'batch',
      placeholder: (
        <>
          <UIText>Filter by Year</UIText>
        </>
      ),
      options: batchOptions,
      onSelectChange: (value: string) => handleFilterChange('batch', value),
      defaultValue: selectedFilters.batch || cur_batch_id?.toString(),
      value: selectedFilters.batch || cur_batch_id?.toString,
    },
  ];

  if (user.role_name != ROLE_NAME.SUPER_ADMIN) {
    filters.pop();
  }

  return (
    <>
      <div className="flex justify-end items-center">
        <DownloadExcelBtn
          apiEndPoint={`reports/generate-school-report/?batch_id=${selectedFilters?.batch ? selectedFilters?.batch : cur_batch_id}&school_id=${selectedInstituteFilter ? selectedInstituteFilter : schoolId}&download=true`}
          fileName={'school_report'}
        />
      </div>
      <AppsContainer fullView={true}>
        <DynamicTable
          data={Array.isArray(schoolReportList?.results) ? schoolReportList?.results || [] : []}
          columns={schoolReportColumns}
          loading={isLoading}
          totalCount={schoolReportList?.totalCount || 0}
          pageSize={pageQuery.page_size}
          pageIndex={(pageQuery.page ?? 1) - 1}
          onPaginationChange={handlePaginationChange}
          selectFilters={filters}
        />
      </AppsContainer>
    </>
  );
};

export default SchoolReportList;
