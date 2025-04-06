import AppsContainer from '@/app/components/AppsContainer';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import UIText from '@/components/global/Text/UIText';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { capitalizeFirstLetter, formatDate, formatTerm, formatTimeOnly } from '@/lib/common-functions';
import { useAssessmentList } from '@/services/assessments/assessments.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef, Row } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamTimeTablList = () => {
  const setSubjectDetailsId = useGlobalState((state: any) => state.setSubjectDetailsId);
  const cur_batch_id = useRoleBasedCurrentBatch();
  const school_id = useRoleBasedSchoolId();
  const [selectedTermFilter, setTermSelectedFilter] = useState<string>();
  const [selectedFilter, setSelectedFilter] = useState<string>();
  const navigate = useNavigate();
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    ordering: '-created_at',
  });
  const { data: assessmentList, isLoading } = useAssessmentList({
    ...pageQuery,
    term: selectedTermFilter || undefined,
    grade: selectedFilter || undefined,
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };

  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  const examTimetableColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'assessment_name',
      header: 'Assessment Name',
      cell: (info: any) => {
        const subjectName = capitalizeFirstLetter(info.getValue());
        return (
          <div className="flex items-center gap-2">
            <span>{subjectName ? subjectName : '-'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'assessment_subjects',
      header: 'Subject Name',
      cell: (info: any) => {
        const subjectList = info.getValue();
        return (
          <div className="flex flex-col gap-2">
            {subjectList.length > 0
              ? subjectList.map((subject: any, index: number) => (
                  <span key={index}>
                    {subject.subject_name}
                    {index !== subjectList.length - 1 && ','}
                    <br />
                  </span>
                ))
              : '-'}
          </div>
        );
      },
    },
    // {
    //   accessorKey: 'batch__start_year',
    //   header: 'Year',
    //   cell: (info: any) => {
    //     const Year = info.getValue();
    //     return <span>{Year ? formatTerm(Year) : '-'}</span>;
    //   },
    // },
    {
      accessorKey: 'term__term_name',
      header: 'Term',
      cell: (info: any) => {
        const termName = info.getValue();
        return <span>{termName ? formatTerm(termName) : '-'}</span>;
      },
    },
    {
      accessorKey: 'grade__grade_number',
      header: 'Grade',
      cell: (info: any) => {
        const gradeNumber = info.getValue();
        return <span>{gradeNumber ? gradeNumber : '-'}</span>;
      },
    },
    {
      accessorKey: 'grade_class__name',
      header: 'Class',
      cell: (info: any) => {
        const classNames = info.getValue();

        return <div className="flex items-center gap-2">{classNames ? classNames : '-'}</div>;
      },
    },
    {
      accessorKey: 'assessment_start_datetime',
      header: 'Start Date',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return formatDate(date);
      },
    },
    {
      accessorKey: 'assessment_end_datetime',
      header: 'End Date',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return formatDate(date);
      },
    },
    {
      accessorKey: 'assessment_start_datetime',
      header: 'Start Time',
      cell: (info) => {
        const { assessment_start_datetime } = info.row.original;
        const startDate = new Date(assessment_start_datetime);
        return <div>{formatTimeOnly(startDate)}</div>;
      },
    },
    {
      accessorKey: 'assessment_end_datetime',
      header: 'End Time',
      cell: (info) => {
        const { assessment_end_datetime } = info.row.original;
        const endDate = new Date(assessment_end_datetime);
        return <div>{formatTimeOnly(endDate)}</div>;
      },
    },
    // {
    //   id: 'actions',
    //   header: 'Actions',
    //   cell: ({ row }: { row: Row<any> }) => (
    //     <>
    //       <div className="flex space-x-2 items-center">
    //         <TableViewBtn
    //           onClick={() => {
    //             handleDetails(row.original);
    //           }}
    //         />
    //       </div>
    //     </>
    //   ),
    // },
  ];

  // const handleDetails = (id: number, gradeId: number) => {
  //   navigate(`/assessment-timetable/details/${id}`, { state: { gradeId } });
  // };

  // const handleDetails = (data: any) => {
  //   navigate(`/assessment-timetable/details/${data?.id}`);
  //   setSubjectDetailsId({
  //     subjectdetailsid: {
  //       id: data?.id,
  //     },
  //     gradeclass: {
  //       id: data?.grade_class,
  //     },
  //   });
  // };

  const handleRowClick = (id: number, data: any) => {
    navigate(`/assessment-timetable/details/${id}`);
    setSubjectDetailsId({
      subjectdetailsid: {
        id: data?.id,
      },
      gradeclass: {
        id: data?.grade_class,
      },
    });
  };

  const handleGradeSelectChange = (value: string) => {
    setSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const handleTermSelectChange = (value: string) => {
    setTermSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const { data: termListQuery } = useTermList({
    sort: 'asc',
    batch_id: cur_batch_id,
    school_id: school_id ? school_id : undefined,
  });

  const { options: termOptions } = useListOption({
    listData: termListQuery?.list,
    labelKey: 'term_name',
    valueKey: 'id',
  });

  const { data: gradeListQuery } = useGradeList({
    sort: 'asc',
    batch_id: cur_batch_id,
    school_id: school_id ? school_id : undefined,
  });

  const { options } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  return (
    <>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          <DynamicTable
            data={Array.isArray(assessmentList?.results) ? assessmentList?.results || [] : []}
            columns={examTimetableColumns}
            loading={isLoading}
            searchColumn="assessment_name"
            searchPlaceholder="Search by Assessment Name"
            totalCount={assessmentList?.totalCount || 0}
            pageSize={pageQuery.page_size}
            pageIndex={(pageQuery.page ?? 1) - 1}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchInputChange}
            moduleName="Assessment Timetable"
            handleRowClick={handleRowClick}
            selectFilters={[
              {
                key: 'term',
                placeholder: (
                  <>
                    <UIText>Filter by Term</UIText>
                  </>
                ),
                options: termOptions.map((term) => ({
                  label: formatTerm(term.label),
                  value: term.value,
                })),
                onSelectChange: handleTermSelectChange,
              },
              {
                key: 'grade',
                placeholder: (
                  <>
                    <UIText>Filter by Grade</UIText>
                  </>
                ),
                options: options,
                onSelectChange: handleGradeSelectChange,
              },
            ]}
          />
        </div>
      </AppsContainer>
    </>
  );
};

export default ExamTimeTablList;
