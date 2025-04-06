import UILoader from '@/components/custom/loaders/UILoader';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import { useDivisionList } from '@/services/master/division/division.hook';
import { QueryParams } from '@/services/types/params';
import React from 'react';
import { classColumns } from './ClassColumn';
import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';

export default function ClasssList() {
  const [pageQuery, setPageQuery] = React.useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  const [selectedCity, setSelectedCity] = React.useState<string>();
  const [selectedState, setSelectedState] = React.useState<string>();

  const teacherListQuery = useDivisionList({
    ...pageQuery,
    city_id: selectedCity || undefined,
    state_id: selectedState || undefined,
  });

  // Handle pagination change
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  // Handle city filter change
  const handleCitySelectChange = (value: string) => {
    setSelectedCity(value);
    setPageQuery((prev) => ({
      ...prev,
      page: 1, // Reset to the first page when filter changes
    }));
  };

  // Handle state filter change
  const handleStateSelectChange = (value: string) => {
    setSelectedState(value);
    setPageQuery((prev) => ({
      ...prev,
      page: 1, // Reset to the first page when filter changes
    }));
  };

  return (
    <>
      <PageTitle
        extraItem={
          <CreateButton
            moduleName="class"
            // action="add"
            redirectTo="/class/add"
          />
        }
        breadcrumbs={[{ label: 'Class List', href: '/class/list' }]}
      >
        Class List
      </PageTitle>
      <AppsContainer title="" fullView={true} type="bottom">
        <div className="p-4">
          {teacherListQuery.isLoading && <UILoader />}
          {teacherListQuery.isSuccess && (
            <DynamicTable
              data={teacherListQuery.data?.list || []}
              columns={classColumns}
              totalCount={teacherListQuery.data?.totalCount || 0}
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
              selectFilters={[
                {
                  key: 'state',
                  placeholder: 'Filter by Province',
                  options: [
                    { label: 'California', value: '1' },
                    { label: 'New York', value: '2' },
                  ],
                  onSelectChange: handleStateSelectChange,
                },
                {
                  key: 'city',
                  placeholder: 'Filter by District',
                  options: [
                    { label: 'New York', value: '1' },
                    { label: 'San Francisco', value: '2' },
                  ],
                  onSelectChange: handleCitySelectChange,
                },
              ]}
            />
          )}
        </div>
      </AppsContainer>
    </>
  );
}
