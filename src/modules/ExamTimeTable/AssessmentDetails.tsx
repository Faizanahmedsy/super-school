import UILoader from '@/components/custom/loaders/UILoader';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { capitalizeFirstLetter, formatDate, formatTimeOnly } from '@/lib/common-functions';
import { useAssessmentDetails, useSubjectWiseAssessmentList } from '@/services/assessments/assessments.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Card } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AssessmentDetails() {
  const subjectDetailsId = useGlobalState((state) => state.subjectDetailsId);
  const school_id = useRoleBasedSchoolId();
  const navigate = useNavigate();

  const setBatchId = useGlobalState((state) => state.setBatchId);
  const setTermId = useGlobalState((state) => state.setTermId);
  const setGradeId = useGlobalState((state) => state.setGradeId);

  const setStartingDate = useGlobalState((state) => state.setStartDate);
  const setEndingDate = useGlobalState((state) => state.setEndDate);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    city_id: '',
    state_id: '',
    school_id: school_id ? school_id : undefined,
  });

  const { data: getSubjectWiseAssessment } = useSubjectWiseAssessmentList({
    ...pageQuery,
    assessment: subjectDetailsId.subjectdetailsid?.id,
    grade_class: subjectDetailsId.gradeclass?.id,
    school_id: school_id ? school_id : undefined,
  });

  const { data: assessmentsDetails, isLoading } = useAssessmentDetails(subjectDetailsId?.subjectdetailsid?.id, {
    grade_class: subjectDetailsId.gradeclass?.id,
    school_id: school_id ? school_id : undefined,
  });

  setStartingDate(assessmentsDetails?.results[0]?.assessment_start_datetime);
  setEndingDate(assessmentsDetails?.results[0]?.assessment_end_datetime);

  setBatchId(assessmentsDetails?.results[0]?.batch);
  setTermId(assessmentsDetails?.results[0]?.term);
  setGradeId(assessmentsDetails?.results[0]?.grade);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const columns: ColumnDef<any[0]>[] = [
    {
      accessorKey: 'subject__master_subject__subject_code',
      header: 'Subject Code',
    },
    {
      accessorKey: 'subject__master_subject__subject_name',
      header: 'Subject Name',
      cell: (info) => {
        const { subject__master_subject__subject_name } = info.row.original;
        const subjectName = capitalizeFirstLetter(subject__master_subject__subject_name);
        return <div>{subjectName}</div>;
      },
    },
    {
      accessorKey: 'paper_title',
      header: 'Paper Title',
      cell: (info: any) => {
        const paperTitle = info.getValue();
        return <div className="flex flex-col gap-2">{paperTitle ? paperTitle : '-'}</div>;
      },
    },

    // {
    //   accessorKey: 'grade__grade_number',
    //   header: 'Grade',
    // },

    // {
    //   accessorKey: 'grade_class_names',
    //   header: 'Grade Class',
    // },

    {
      accessorKey: 'assessment_start_datetime',
      header: 'Date',
      cell: (info) => {
        const { assessment_start_datetime } = info.row.original;
        const startDate = new Date(assessment_start_datetime);
        return <div>{formatDate(startDate)}</div>;
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
  ];

  const startDate = new Date(assessmentsDetails?.results[0].assessment_start_datetime);
  const endDate = new Date(assessmentsDetails?.results[0].assessment_end_datetime);

  // Display formatted date and time
  const startDateStr = formatDate(startDate);

  const endDateStr = formatDate(endDate);
  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            {
              label: 'Assessment Timetable List',
              href: '/assessment-timetable',
              onClick: () => {
                navigate('/assessment-timetable', { state: { key: '2' } });
              },
            },
            {
              label: 'Assessment Subject Details',
              href: `/assessment-timetable/details/${subjectDetailsId?.subjectdetailsid?.id}`,
            },
          ]}
        >
          Assessment Subject Details
        </PageTitle>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-slate-500">General Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UILoader />
            ) : assessmentsDetails?.results?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                {[
                  { label: 'Year', value: assessmentsDetails.results[0].batch__start_year },
                  { label: 'Grade', value: assessmentsDetails.results[0].grade__grade_number },
                  { label: 'Term', value: assessmentsDetails.results[0].term__term_name },
                  { label: 'Class', value: assessmentsDetails.results[0].grade_class__name },
                  { label: 'Assessment Name', value: assessmentsDetails.results[0].assessment_name },
                  { label: 'Start Date', value: startDateStr },
                  { label: 'End Date', value: endDateStr },
                ].map((item, index) => (
                  <div key={index} className="bg-secondary shadow-md rounded-lg p-3">
                    <label className="text-sm text-muted-foreground">{item.label}</label>
                    <p className="mb-0">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>
                  <UIText>No data Found</UIText>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-4">
            <DynamicTable
              data={Array.isArray(getSubjectWiseAssessment?.results) ? getSubjectWiseAssessment?.results || [] : []}
              columns={columns}
              loading={isLoading}
              totalCount={getSubjectWiseAssessment?.totalCount || 0}
              // searchColumn="school_name"
              // searchPlaceholder="Search by School Name / EMIS Number"
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
