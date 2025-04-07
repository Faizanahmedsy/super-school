import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { formatTerm } from '@/lib/common-functions';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { useAssessmentList, useBatchList } from '@/services/assessments/assessments.hook';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { Breadcrumb } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assessmentColumns } from './mutate/Assessmnets.column';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';

const AssessmentList = () => {
  const params = useLocation();
  const [step, setStep] = useState<number>(1);

  // const setFilterData = useGlobalState((state) => state.setFilterData);
  const school_id = useRoleBasedSchoolId();
  const filterData = useGlobalState((state) => state.filterData);
  // const cur_batch_id = useRoleBasedCurrentBatch();
  const cur_batch_id = useRoleBasedCurrentBatch();
  const setSubjectDetailsId = useGlobalState((state: any) => state.setSubjectDetailsId);
  const setFilterData = useGlobalState((state) => state.setFilterData);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    grade: filterData?.grade?.id,
    term: filterData?.term?.id,
    grade_class: filterData?.class?.id,
    subject: filterData?.subject?.id && filterData?.subject?.id != 'null' ? filterData?.subject?.id : undefined,
    city_id: '',
    state_id: '',
    school_id: school_id ? school_id : undefined,
    ordering: '-created_at',
  });

  const isFilterApplied = {
    batch: filterData?.batch?.id && filterData?.batch?.id !== 'null' ? true : false,
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null' ? true : false,
    class: filterData?.class?.id && filterData?.class?.id !== 'null' ? true : false,
    term: filterData?.term?.id && filterData?.term?.id !== 'null' ? true : false,
    subject: filterData?.subject?.id && filterData?.subject?.id !== 'null' ? true : false,
  };

  const [selectedFilter, setSelectedFilter] = useState<string>();
  const [selectedYearFilter, setYearSelectedFilter] = useState<string>();
  const [selectedTermFilter, setTermSelectedFilter] = useState<string>();
  const [selectedClassFilter, setClassSelectedFilter] = useState<string>();
  const [selectedSubjectFilter, setSubjectSelectedFilter] = useState<string>();
  // const [batchDefaultValue, setBatchDefaultValue] = useState<string>();

  const setBreadCrumbStep = useGlobalState((state) => state.setBreadCrumbStep);
  const setCurrentStep = useGlobalState((state) => state.setCurrentStep);

  const user = useGlobalState((state) => state.user);

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

  const { data: assessmentList, isLoading } = useAssessmentList({
    ...pageQuery,
    batch: selectedYearFilter || undefined,
    term: selectedTermFilter || undefined,
    grade: selectedFilter || undefined,
    grade_class: selectedClassFilter || undefined,
    assessment_subject: selectedSubjectFilter || undefined,
    school_id: school_id ? school_id : undefined,
  });

  const navigate = useNavigate();

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };
  const breadcrumbs: any = useGlobalState((state) => state.breadcrumbs_step);

  useEffect(() => {
    if (breadcrumbs && params.pathname == '/assessments') {
      setStep(breadcrumbs);
    } else {
      setStep(5);
    }
  }, [breadcrumbs]);

  const breadcrumbItems = [
    { label: isFilterApplied?.batch ? filterData.batch?.name : 'Select Year', step: 1 },
    { label: isFilterApplied?.grade ? filterData.grade?.name : 'Select Grade', step: 3 },
    { label: isFilterApplied?.term ? formatTerm(filterData.term?.name as string) : 'Select Term', step: 2 },
    { label: isFilterApplied?.class ? filterData.class?.name : 'Select Class', step: 4 },
    { label: 'Assessment List', step: 5 },
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
  const { data: classListQuery } = useDivisionList(
    {
      sort: 'asc',
      grade_id: selectedFilter,
      batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
      school_id: school_id ? school_id : undefined,
      // term_id: selectedTermFilter,
    },
    Boolean(selectedFilter)
  );

  const { options: classOptions } = useListOption({
    listData: classListQuery?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  const { data } = useSubjectList(
    {
      grade_id: selectedFilter,
      batch_id: selectedYearFilter ? selectedYearFilter : cur_batch_id,
      term_id: selectedTermFilter,
      school_id: school_id ? school_id : undefined,
    },
    Boolean(selectedFilter)
  );

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
    navigate(`/assessments/details/${id}`);
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
      <PageTitle
        extraItem={
          <CreateButton
            moduleName={MODULE.ASSESSMENTS}
            action={ACTION.ADD}
            onClick={() => {
              navigate('/assessment/add');
              setCurrentStep(1);
            }}
          />
        }
      >
        Assessment List
      </PageTitle>
      {user?.role_name != 'super_admin' && isFilterApplied.batch && (
        <Breadcrumb>
          <BreadcrumbList>
            {step > 1 &&
              visibleBreadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.step}>
                  <BreadcrumbLink
                    href="#"
                    onClick={() => {
                      setStep(item.step);
                      setBreadCrumbStep(item.step);
                      navigate('/assessments');
                      if (item?.step === 1) {
                        setFilterData({});
                      }
                    }}
                    className={step === item.step ? 'font-bold text-blue-600' : ''}
                  >
                    {item.label}
                  </BreadcrumbLink>
                  {index < visibleBreadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <AppsContainer fullView={true} cardStyle={{ padding: '20px' }}>
        <DynamicTable
          data={Array.isArray(assessmentList?.results) ? assessmentList?.results || [] : []}
          columns={assessmentColumns}
          loading={isLoading}
          searchColumn="assessment_name"
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
    </div>
  );
};
export default AssessmentList;
