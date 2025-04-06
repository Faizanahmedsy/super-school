import AppsContainer from '@/app/components/AppsContainer';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import ChooseClassTile from '@/components/global/Tiles/ChooseClassTile';
import ChooseGradeTile from '@/components/global/Tiles/ChooseGradeTile';
import ChooseTermTile from '@/components/global/Tiles/ChooseTermTile';
import ChooseYearTile from '@/components/global/Tiles/ChooseYearTile';
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useListOption } from '@/hooks/use-select-option';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { capitalizeFirstLetter, formatTerm } from '@/lib/common-functions';
import { cn } from '@/lib/utils';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { useAssessmentList, useBatchList } from '@/services/assessments/assessments.hook';
import { useDigitalMarkingProcess } from '@/modules/Dashboards/action/dashboard.actions';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { Row } from '@tanstack/react-table';
import { Breadcrumb, Card, Progress } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UIText from '@/components/global/Text/UIText';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';

const MarkingProcess = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>();
  const [selectedYearFilter, setYearSelectedFilter] = useState<string>();
  const [selectedTermFilter, setTermSelectedFilter] = useState<string>();
  const [selectedClassFilter, setClassSelectedFilter] = useState<string>();
  const [selectedSubjectFilter, setSubjectSelectedFilter] = useState<string>();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const cur_batch_id = useRoleBasedCurrentBatch();
  const { data: digitalMarkings } = useDigitalMarkingProcess({
    batch: selectedYearFilter || undefined,
    term: selectedTermFilter || undefined,
    grade: selectedFilter || undefined,
    grade_class: selectedClassFilter || undefined,
  });

  // const setAssessmentDetailsId = useGlobalState((state: any) => state.setAssessmentDetailsId);
  const school_id = useRoleBasedSchoolId();

  const setSubjectDetailsId = useGlobalState((state: any) => state.setSubjectDetailsId);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    city_id: '',
    state_id: '',
    ordering: '-created_at',
    school_id: school_id ? school_id : undefined,
  });

  const { data: assessmentList, isPending } = useAssessmentList({
    ...pageQuery,
    status: 'completed',
    batch: selectedYearFilter || undefined,
    term: selectedTermFilter || undefined,
    grade: selectedFilter || undefined,
    grade_class: selectedClassFilter || undefined,
    assessment__assessment_subjects__subject: selectedSubjectFilter || undefined,
  });

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const columns: any = [
    {
      accessorKey: 'assessment_name',
      header: 'Assessment Name',
      cell: (info: any) => {
        const subjectName = capitalizeFirstLetter(info.getValue());
        return (
          <div className="flex items-center gap-2">
            <span>{subjectName}</span>
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
    {
      accessorKey: 'assessment_subjects',
      header: 'Paper Title',
      cell: (info: any) => {
        const subjectList = info.getValue();
        return (
          <div className="flex flex-col gap-2">
            {subjectList.length > 0
              ? subjectList.map((subject: any, index: number) => (
                  <span key={index}>
                    {subject.paper_title}
                    {index !== subjectList.length - 1 && ','}
                    <br />
                  </span>
                ))
              : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'term__term_name',
      header: 'Term',
    },
    {
      accessorKey: 'grade__grade_number',
      header: 'Grade',
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
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => {
        return (
          <span
            className={cn(
              'px-2 py-1 rounded-full text-[12px] text-white',
              info.getValue() === 'completed' && '  bg-green-600',
              info.getValue() === 'upcoming' && '  bg-orange-600',
              info.getValue() === 'cancelled' && 'bg-red-600',
              info.getValue() === 'ongoing' && '  bg-blue-600'
            )}
          >
            {capitalizeFirstLetter(info.getValue())}
          </span>
        );
      },
    },

    {
      accessorKey: 'assessment_start_datetime',
      header: 'Date',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return formatDate(date);
      },
    },
    {
      accessorKey: 'ocr_status',
      header: 'Grading Status',
      cell: (info: any) => {
        return (
          <span
            className={cn(
              'px-2 py-1 rounded-full text-[12px] text-white',
              info.getValue() === 'completed' && '  bg-green-600',
              info.getValue() === 'in progress' && '  bg-orange-600',
              info.getValue() === 'not started' && '  bg-gray-600'
            )}
          >
            {capitalizeFirstLetter(info.getValue() as string)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <div className="flex space-x-2">
          <TableViewBtn onClick={() => handleDetails(row.original)} />
        </div>
      ),
    },
  ];

  const handleDetails = (details: any) => {
    navigate(`/grading-process/assessment/details/${details?.id}`);
    setSubjectDetailsId({
      subjectdetailsid: {
        id: details?.id,
      },
      gradeclass: {
        id: details?.grade_class,
      },
    });
  };

  // const handleEdit = (id: number) => {
  //   navigate(`/assessment/update/${id}`, { state: { key: 'edit' } });
  // };

  // const handleDelete = (id: number) => {
  //   Modal.confirm({
  //     centered: true,
  //     title: 'Are you sure,you want to Delete?',
  //     okText: 'yes',
  //     onOk: async () => {
  //       deleteAssessments(id, {
  //         onSuccess: () => {
  //           refetch();
  //         },
  //       });
  //     },
  //   });
  // };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };

  // useEffect(() => {
  //   if (breadcrumbs && params.pathname == '/assessments') {
  //     setStep(breadcrumbs);
  //   } else {
  //     setStep(5);
  //   }
  // }, [breadcrumbs]);

  const filterData = useGlobalState((state) => state.filterData);

  const isFilterApplied = {
    batch: filterData?.batch?.id && filterData?.batch?.id !== 'null' ? true : false,
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null' ? true : false,
    class: filterData?.class?.id && filterData?.class?.id !== 'null' ? true : false,
    term: filterData?.term?.id && filterData?.term?.id !== 'null' ? true : false,
    subject: filterData?.subject?.id && filterData?.subject?.id !== 'null' ? true : false,
  };

  useEffect(() => {
    if (isFilterApplied.grade && filterData) {
      setSelectedFilter(filterData?.grade?.id);
    }
    if (isFilterApplied.class && filterData) {
      setClassSelectedFilter(filterData?.class?.id);
    }
    if (isFilterApplied.term && filterData) {
      setTermSelectedFilter(filterData?.term?.id);
    }
    if (isFilterApplied.batch && filterData) {
      setYearSelectedFilter(filterData?.batch?.id);
    }
    if (isFilterApplied.subject && filterData) {
      setSubjectSelectedFilter(filterData?.subject?.id);
    }
  }, [filterData.grade, filterData.class, filterData.term, filterData.batch, filterData.subject]);

  const breadcrumbItems = [
    { label: filterData.batch?.name, step: 1 },
    { label: filterData.grade?.name, step: 2 },
    { label: formatTerm(filterData.term?.name as string), step: 3 },
    { label: filterData.class?.name, step: 4 },
    { label: 'Grading Process', step: 5 },
  ];
  const visibleBreadcrumbItems = breadcrumbItems.filter((item) => item.step < step + 1);

  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  // Handle Grade Select Change
  const handleGradeSelectChange = (value: string) => {
    setSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  // Handle Batch Select Change
  const handleBatchSelectChange = (value: string) => {
    setYearSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  // Handle Term Select Change
  const handleTermSelectChange = (value: string) => {
    setTermSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  // Handle Class Select Change
  const handleClassSelectChange = (value: string) => {
    setClassSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const handleSubjectSelectChange = (value: string) => {
    setSubjectSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const { data: gradeListQuery } = useGradeList({
    sort: 'asc',
    batch_id: selectedYearFilter,
    school_id: school_id ? school_id : undefined,
  });

  const { options } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });
  const { data: batchListQuery } = useBatchList({
    sort: 'asc',
    school_id: school_id ? school_id : undefined,
  });
  const { options: batchOptions } = useListOption({
    listData: batchListQuery?.list,
    labelKey: 'start_year',
    valueKey: 'id',
  });

  const { data: termListQuery } = useTermList({
    sort: 'asc',
    school_id: school_id ? school_id : undefined,
    batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
  });

  const { options: termOptions } = useListOption({
    listData: termListQuery?.list,
    labelKey: 'term_name',
    valueKey: 'id',
  });
  const { data: classListQuery } = useDivisionList({
    sort: 'asc',
    grade_id: selectedFilter,
    batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
    school_id: school_id ? school_id : undefined,
    // term_id: selectedTermFilter,
  });

  const { options: classOptions } = useListOption({
    listData: classListQuery?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  const { data } = useSubjectList({
    grade_id: selectedFilter,
    batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
    term_id: selectedTermFilter,
    school_id: school_id ? school_id : undefined,
  });

  // Create a properly formatted subject list
  const subjectList =
    data?.subjects.map((subject: any) => ({
      label: subject?.master_subject?.subject_name,
      value: subject?.id,
    })) || [];

  // Pass the list to useListOption
  const { options: subjectOptions } = useListOption({
    listData: subjectList,
    labelKey: 'label',
    valueKey: 'value',
  });

  const handleRowClick = (id: number, data: any) => {
    navigate(`/grading-process/assessment/details/${id}`);
    setSubjectDetailsId({
      subjectdetailsid: {
        id: data?.id,
      },
      gradeclass: {
        id: data?.grade_class,
      },
    });
  };

  return (
    <div>
      <PageTitle>Grading Process</PageTitle>
      <Breadcrumb className="pb-5">
        <BreadcrumbList>
          {step > 1 &&
            visibleBreadcrumbItems.map((item, index) => (
              <BreadcrumbItem key={item.step}>
                <BreadcrumbLink
                  href="#"
                  onClick={() => setStep(item.step)}
                  className={step === item.step ? 'font-bold text-blue-600' : ''}
                >
                  {item.label}
                </BreadcrumbLink>
                {index < visibleBreadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
      {step == 1 && <ChooseYearTile step={step} setStep={setStep} isMarkingProcess={true} />}
      {step == 2 && <ChooseGradeTile step={step} setStep={setStep} viewBtn={false} />}
      {step == 3 && <ChooseTermTile step={step} setStep={setStep} />}
      {/* {step == 3 && <ChooseSubject step={step} setStep={setStep} />} */}
      {step == 4 && <ChooseClassTile step={step} setStep={setStep} viewBtn={false} onTileClick={() => ''} />}
      {step == 5 && (
        <>
          <Card className="w-full">
            <CardHeader className="relative z-10">
              <CardTitle className="flex justify-between items-center">
                <div>
                  <UIText>Grading Progress</UIText>
                </div>
              </CardTitle>
              {/* <CardDescription>Select a year to explore the associated data and insights.</CardDescription> */}
            </CardHeader>
            <CardContent className="px-6 mt-5">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 place-content-center">
                <div className="flex flex-col items-center space-y-2">
                  <Progress
                    type="circle"
                    percent={digitalMarkings?.percentages?.upcoming}
                    strokeColor={'red'}
                    strokeWidth={10}
                  />
                  <label className="text-center">
                    <UIText>Upcomming</UIText>
                  </label>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Progress
                    type="circle"
                    percent={digitalMarkings?.percentages?.in_progress}
                    strokeColor={'orange'}
                    strokeWidth={10}
                  />
                  <label className="text-center">
                    <UIText>In Progress</UIText>
                  </label>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Progress
                    type="circle"
                    percent={digitalMarkings?.percentages?.completed}
                    strokeColor={'green'}
                    strokeWidth={10}
                  />
                  <label className="text-center">
                    <UIText>Completed</UIText>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <AppsContainer fullView={true} cardStyle={{ padding: '20px' }}>
            <DynamicTable
              tableTitle="Completed Assessments"
              data={Array.isArray(assessmentList?.results) ? assessmentList?.results : []}
              columns={columns}
              searchColumn="assessment_name"
              loading={isPending}
              searchPlaceholder="Search by Assessment Name"
              totalCount={assessmentList?.totalCount || 0}
              pageSize={pageQuery.page_size}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchInputChange}
              handleRowClick={handleRowClick}
              selectFilters={[
                {
                  key: 'batch',
                  placeholder: (
                    <>
                      <UIText>Filter by Year</UIText>
                    </>
                  ),
                  options: batchOptions,
                  onSelectChange: handleBatchSelectChange,
                  defaultValue: isFilterApplied.batch ? filterData?.batch?.id : cur_batch_id?.toString(),
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
                  defaultValue: isFilterApplied.grade ? filterData?.grade?.id : undefined,
                },
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
                  defaultValue: isFilterApplied.term ? filterData?.term?.id : undefined,
                },
                {
                  key: 'class',
                  placeholder: (
                    <>
                      <UIText>Filter by Class</UIText>
                    </>
                  ),
                  options: classOptions,
                  onSelectChange: handleClassSelectChange,
                  defaultValue: isFilterApplied.class ? filterData?.class?.id : undefined,
                },
                {
                  key: 'subject',
                  placeholder: (
                    <>
                      <UIText>Filter by Subject</UIText>
                    </>
                  ),
                  options: subjectOptions,
                  onSelectChange: handleSubjectSelectChange,
                  defaultValue: isFilterApplied.subject ? filterData?.subject?.id : undefined,
                  width: 'lg:w-[350px]',
                },
              ]}
            />
          </AppsContainer>
        </>
      )}
    </div>
  );
};

export default MarkingProcess;
