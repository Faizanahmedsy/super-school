import AppsContainer from '@/app/components/AppsContainer';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import ChooseClassTile from '@/components/global/Tiles/ChooseClassTile';
import ChooseGradeTile from '@/components/global/Tiles/ChooseGradeTile';
import ChooseTermTile from '@/components/global/Tiles/ChooseTermTile';
import ChooseYearTile from '@/components/global/Tiles/ChooseYearTile';
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import useColumnBasedOnRole from '@/hooks/table/use-columns-based-on-role';
import useFilterOptions from '@/hooks/table/use-filter-options';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { capitalizeFirstLetter, formatTerm } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { useAssessmentList, useBatchList } from '@/services/assessments/assessments.hook';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { Row } from '@tanstack/react-table';
import { Breadcrumb } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UIText from '@/components/global/Text/UIText';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';

const MarkedAnswerScript = () => {
  const navigate = useNavigate();
  const school_id = useRoleBasedSchoolId();
  const [step, setStep] = useState<number>(1);
  const cur_batch_id = useRoleBasedCurrentBatch();

  const user = useGlobalState((state) => state.user);

  const roleName = user?.role_name;

  // const setAssessmentDetailsId = useGlobalState((state: any) => state.setAssessmentDetailsId);

  const setSubjectDetailsId = useGlobalState((state: any) => state.setSubjectDetailsId);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    city_id: '',
    state_id: '',
    ordering: '-created_at',
    is_reviewed: true,
    manual_review: true,
    school_id: school_id ? school_id : undefined,
  });

  const [selectedFilter, setSelectedFilter] = useState<string>();
  const [selectedYearFilter, setYearSelectedFilter] = useState<string>();
  const [selectedTermFilter, setTermSelectedFilter] = useState<string>();
  const [selectedClassFilter, setClassSelectedFilter] = useState<string>();
  const [selectedSubjectFilter, setSubjectSelectedFilter] = useState<string>();

  const { data: assessmentList, isPending } = useAssessmentList({
    ...pageQuery,
    status: 'completed',
    ocr_status: 'completed',
    filter_by_upload: true,
    sheet_update: true,
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
      accessorKey: 'term__term_name',
      header: 'Term',
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
      accessorKey: 'is_reviewed',
      header: 'Manual Review Status',
      cell: (info: any) => {
        const isReviewed = info.getValue();
        return (
          <span
            className={cn('px-2 py-1 rounded-full text-[12px] text-white', isReviewed ? 'bg-green-600' : 'bg-red-600')}
          >
            {capitalizeFirstLetter(isReviewed ? 'Done' : 'Pending')}
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
  // 'grade_class__name', 'grade__grade_number',
  const restrictedKeys = ['ocr_status', 'is_reviewed'];
  // const restrictedKeys = ['grade_class__name', 'grade__grade_number'];

  const filteredColumns = useColumnBasedOnRole({
    columns,
    restrictedKeys,
    additionalColumns: [],
    roleName: ROLE_NAME.STUDENT,
  });

  const handleDetails = (details: any) => {
    navigate(`/marked-answerscript/assessment/details/${details?.id}`);
    setSubjectDetailsId({
      subjectdetailsid: {
        id: details?.assessment_subjects[0].id,
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
    { label: 'Graded Papers', step: 5 },
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
    batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
    school_id: school_id ? school_id : undefined,
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

  const selectFilters: any = [
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
  ];

  // Determine keys to hide based on the role
  const keysToHide = roleName === ROLE_NAME.STUDENT ? ['grade', 'class'] : [];

  // Use the custom hook
  const filteredSelectFilters = useFilterOptions(selectFilters, keysToHide);

  return (
    <div>
      <PageTitle>Graded Papers</PageTitle>
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

      {roleName != ROLE_NAME.STUDENT && (
        <>
          {step == 1 && <ChooseYearTile step={step} setStep={setStep} isMarkingProcess={false} />}
          {step == 2 && <ChooseGradeTile step={step} setStep={setStep} viewBtn={false} />}
          {step == 3 && <ChooseTermTile step={step} setStep={setStep} />}
          {/* {step == 3 && <ChooseSubject step={step} setStep={setStep} />} */}
          {step == 4 && <ChooseClassTile step={step} setStep={setStep} viewBtn={false} onTileClick={() => ''} />}
        </>
      )}

      {(step == 5 || roleName === ROLE_NAME.STUDENT) && (
        <>
          <AppsContainer fullView={true} cardStyle={{ padding: '20px' }}>
            <DynamicTable
              tableTitle="Completed Assessments"
              data={Array.isArray(assessmentList?.results) ? assessmentList?.results : []}
              columns={filteredColumns}
              searchColumn="assessment_name"
              loading={isPending}
              searchPlaceholder="Search by Assessment Name"
              totalCount={assessmentList?.totalCount || 0}
              pageSize={pageQuery.page_size}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchInputChange}
              selectFilters={filteredSelectFilters}
            />
          </AppsContainer>
        </>
      )}
    </div>
  );
};

export default MarkedAnswerScript;
