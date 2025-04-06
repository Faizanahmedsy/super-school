import AppsContainer from '@/app/components/AppsContainer';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useSchoolLearnersReportList } from '@/services/reportmanagement/schoolreport.hook';
import { QueryParams } from '@/services/types/params';
import { useState } from 'react';
import { useSelectFilters } from '../GlobalFilterOnlyReportModule';
import useFilteredColumns from '@/hooks/table/useFilteredColumns';
import DownloadExcelBtn from '@/components/global/DownloadExcel/DownloadExcelBtn';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { ArrowUpDown } from 'lucide-react';
import UIText from '@/components/global/Text/UIText';

const SchoolLearnerReportList = () => {
  const { selectFilters, selectedFilters, searchColumn, searchQuery, handleSearchChange } = useSelectFilters();
  const school_id = useRoleBasedSchoolId();
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
  });

  const { data: schoolLearnerReportList, isLoading } = useSchoolLearnersReportList({
    ...pageQuery,
    school_id: selectedFilters.school ? selectedFilters.school : school_id,
    search: searchQuery,
    batch_id: selectedFilters.batch,
    term: selectedFilters.term,
    grade: selectedFilters.grade,
    grade_class: selectedFilters.class,
    subject_id: selectedFilters.subject,
  });

  const schoolLearnersReportColumns: any = [
    {
      accessorKey: 'admission_no',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering:
                  pageQuery.ordering === 'students__addmission_no'
                    ? '-students__addmission_no'
                    : 'students__addmission_no',
              });
            }}
          >
            <UIText>Admission Number</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info: any) => {
        const schoolName = info.getValue();
        return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
      },
    },
    // {
    //   accessorKey: 'learner_name',
    //   header: 'Learner Name',
    // },
    {
      accessorKey: 'learner_name',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering:
                  pageQuery.ordering === 'students__first_name' ? '-students__first_name' : 'students__first_name',
              });
            }}
          >
            <UIText>Learner Name</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
    },
    {
      accessorKey: 'learner_email',
      header: 'Email',
    },
    {
      accessorKey: 'learner_mobile',
      header: 'Mobile No',
    },
    {
      accessorKey: 'grades_classes',
      header: 'Grade & Class',
      cell: (info: any) => {
        const grade_classes = info.getValue();
        return <span>{grade_classes ? grade_classes : '-'}</span>;
      },
    },
    {
      header: 'Parent Name',
      cell: (info: any) => {
        const data = info.row.original;
        return (
          <span>
            {data?.parents?.map((item: any, index: number) => (
              <span key={index}>
                {item?.parent_name ? capitalizeFirstLetter(item?.parent_name) : '-'}
                <br />
              </span>
            ))}
          </span>
        );
      },
    },
    {
      accessorKey: 'parent_email',
      header: 'Parent Email',
      cell: (info: any) => {
        const data = info.row.original;
        return (
          <span>
            {data?.parents?.map((item: any, index: number) => (
              <span key={index}>
                {item?.parent_email ? item?.parent_email : '-'}
                <br />
              </span>
            ))}
          </span>
        );
      },
    },
    {
      accessorKey: 'parent_mobile',
      header: 'Parent Mobile',
      cell: (info: any) => {
        const data = info.row.original;
        return (
          <span>
            {data?.parents?.map((item: any) => {
              return item?.parent_mobile ? capitalizeFirstLetter(item?.parent_mobile) : '-';
            })}
          </span>
        );
      },
    },
  ];

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };

  const restrictedKeys = ['learner_email', 'learner_mobile', 'parent_email', 'parent_mobile'];
  const schoolLearnersReportcolumns = useFilteredColumns(schoolLearnersReportColumns, restrictedKeys);

  // type Filter = { key: any; [key: string]: any };
  const filters: any = selectFilters.filter((item) => item.key !== 'term');

  return (
    <>
      <div className="flex justify-end items-center">
        <DownloadExcelBtn
          apiEndPoint={`reports/school-learners-report/?${[
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
          fileName={'learners_report'}
        />
      </div>
      <AppsContainer fullView={true}>
        <DynamicTable
          data={Array.isArray(schoolLearnerReportList?.results) ? schoolLearnerReportList?.results || [] : []}
          columns={schoolLearnersReportColumns}
          loading={isLoading}
          totalCount={schoolLearnerReportList?.totalCount || 0}
          pageSize={pageQuery.page_size}
          pageIndex={(pageQuery.page ?? 1) - 1}
          onPaginationChange={handlePaginationChange}
          selectFilters={filters}
          searchPlaceholder="Search by Learner Name / Email"
          searchColumn={searchColumn}
          onSearchChange={handleSearchChange}
        />
      </AppsContainer>
    </>
  );
};

export default SchoolLearnerReportList;
