import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UILoader from '@/components/custom/loaders/UILoader';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InstituteData } from '@/modules/Management/Institutes/types';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { LuEye } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const SelectInstitute = () => {
  const navigate = useNavigate();

  const instituteListQuery = useInstituteList({
    page: 1,
  });

  const [pageQuery, setPageQuery] = React.useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  const setSchoolId = useGlobalState((state) => state.setSchoolId);
  const instituteColumns: ColumnDef<InstituteData>[] = [
    {
      accessorKey: 'school_name',
      header: 'School Name',
      cell: (info) => info.getValue(),
    },

    {
      accessorKey: 'EMIS_number',
      header: 'EMIS Number',
      cell: (info) => info.getValue(),
    },

    {
      header: 'Actions',
      cell: (info) => (
        <>
          <Button
            onClick={() => {
              navigate(`/module/select`);
              setSchoolId(info.row.original.id.toString());
            }}
            className={cn('transition-transform duration-300 transform hover:scale-105 rounded-xl')}
            variant="outline"
          >
            <LuEye size={18} className="text-blue-600" />
          </Button>
        </>
      ),
    },
  ];
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  return (
    <>
      <AppPageMeta title="Select School" />
      <PageTitle
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          {
            label: 'Select School',
            href: '/role/select',
          },
        ]}
      >
        Select School
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          {instituteListQuery.isLoading && <UILoader />}
          {instituteListQuery.isSuccess && (
            <DynamicTable
              data={instituteListQuery.data?.list || []}
              columns={instituteColumns}
              totalCount={instituteListQuery.data?.totalCount || 0}
              searchColumn="school_name"
              searchPlaceholder="Search by School Name"
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
            />
          )}
        </div>
      </AppsContainer>
    </>
  );
};

export default SelectInstitute;
