import UILoader from '@/components/custom/loaders/UILoader';
import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import DownloadAnswersheetBtn from '@/components/global/DownloadAnswersheet/DownloadAnswersheetBtn';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { calculateExamDuration, capitalizeFirstLetter, formatDate, getTimeFromISO } from '@/lib/common-functions';
import { cn } from '@/lib/utils';
import { useAssessmentWiseStudentstList, useSubjectDetailsList } from '@/services/assessments/assessments.hook';
import { QueryParams } from '@/services/types/params';
import { ColumnDef } from '@tanstack/react-table';
import { Tooltip } from 'antd';
import { ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function MarkedAnswerScriptDetails() {
  const navigate = useNavigate();
  const params: any = useParams();
  const [_, setLocked] = useState(false);
  const school_id = useRoleBasedSchoolId();

  const [searchParams] = useSearchParams();
  const gradeId = searchParams.get('grade_class');

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    city_id: '',
    state_id: '',
    is_reviewed: true,
    filter_by_upload: true,
    sheet_update: true,
    school_id: school_id ? school_id : undefined,
  });

  // const fileUrl = JANGO_PDF_ENDPOINT;
  const { data: subjectDetails } = useSubjectDetailsList({ id: params?.id });

  // const batch_id: any = useRoleBasedCurrentBatch();
  // const grade_id = useGlobalState((state) => state.grade_id);
  // const term_id = useGlobalState((state) => state.term_id);
  // const division_id = useGlobalState((state) => state.division_id);

  const { data: getSubjectWiseStudent, isLoading } = useAssessmentWiseStudentstList({
    ...pageQuery,
    filter_by_upload: true,
    sheet_update: true,
    assessment_subject: params?.id,
    grade_class: gradeId ? gradeId : undefined,
  });

  useEffect(() => {
    if (getSubjectWiseStudent?.results && Array.isArray(getSubjectWiseStudent?.results)) {
      const isLocked = getSubjectWiseStudent?.results.some((item: any) => item.is_locked === true);
      setLocked(isLocked);
    }
  }, [getSubjectWiseStudent]);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const columns: ColumnDef<any[number]>[] = [
    {
      accessorKey: 'student.profile_image',
      header: '',
      cell: (info) => <ProfileImageAvatar info={info} />,
    },
    {
      accessorKey: 'student.first_name',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering: pageQuery.ordering === 'student__first_name' ? '-student__first_name' : 'student__first_name',
              });
            }}
          >
            <UIText>Name</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        return (
          <div
            className={cn('flex items-center space-x-2 ', info.row.original.ocr_status && 'bg-nsc-red/30 rounded-sm')}
          >
            {value as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'student.last_name',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering: pageQuery.ordering === 'student__first_name' ? '-student__first_name' : 'student__first_name',
              });
            }}
          >
            <UIText>Surname</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        return (
          <div
            className={cn('flex items-center space-x-2 ', info.row.original.ocr_status && 'bg-nsc-red/30 rounded-sm')}
          >
            {value as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'student.admission_no',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering: pageQuery.ordering === 'admission_number' ? '-admission_number' : 'admission_number',
              });
            }}
          >
            <UIText>Addmission No</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="flex items-center space-x-2 ">
            {value != null ? String(value) : ''}
            {/* <span className="flex gap-3">
              {value != null ? String(value) : ''}
              <MdContentCopy
                size={20}
                className="cursor-pointer"
                onClick={() =>
                  copy(value != null ? String(value) : '', {
                    debug: true,
                    message: 'Press #{key} to copy',
                  })
                }
              />
            </span> */}
          </div>
        );
      },
    },
    {
      header: 'Marks',
      cell: (info) => {
        const value = info.row.original;
        return (
          <div>
            <p className="mb-0">{`${value?.obtained_mark}/${value?.paper_marks}`}</p>
          </div>
        );
      },
    },

    {
      accessorKey: 'achievements_level',
      header: () => {
        return <div className="text-primary">Marks in (%)</div>;
      },
      cell: (info: any) => {
        const { mark_percentage } = info.row.original;
        return (
          <div className="w-30 mb-0">
            <p className="flex items-center justify-between mb-0">{`${mark_percentage ? mark_percentage : '-'}`}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'answer_sheet',
      header: 'Result Sheet',
      cell: () => {
        const data = getSubjectWiseStudent?.results;

        const studentName = `${data?.student?.first_name} ${data?.student?.last_name}`;

        return (
          <div>
            <div className="cursor-pointer w-20">
              <Tooltip title="Answersheet">
                <DownloadAnswersheetBtn
                  apiEndPoint={`student-answersheet/download/`}
                  answersheetId={data?.id}
                  studentName={studentName?.toLowerCase()}
                  showType="table"
                  pdfName="Answersheet"
                />
              </Tooltip>
            </div>
          </div>
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
      accessorKey: 'student.ocr_status',
      header: 'Review Answer sheet',
      cell: (info) => {
        const { is_reviewed, not_detected_word_count, id } = info.row.original;
        if (!info?.row?.original?.ocr_status) {
          return <div className="flex justify-center items-center">-</div>;
        }
        return (
          <div>
            <Button
              variant={'outline'}
              className={cn(
                'hover:bg-white hover:text-black',
                is_reviewed || (not_detected_word_count.length > 0 && 'bg-rose-700 text-rose-50')
              )}
              onClick={() => {
                const componentName = 'review-answesheet';
                navigate(`/marked-answerscript/instant-grades/review/${id}`, {
                  state: { componentName, assessment_subject: params?.id, grade_class: gradeId ? gradeId : undefined },
                });
              }}
            >
              {is_reviewed ? 'Preview Result' : 'Review'}{' '}
              {not_detected_word_count.length > 0 && `(${not_detected_word_count})*`}
            </Button>
          </div>
        );
      },
    },
  ];

  const startDate: any = new Date(subjectDetails?.results[0].assessment_start_datetime);
  const endDate: any = new Date(subjectDetails?.results[0].assessment_end_datetime);

  const startDateStr = formatDate(startDate);
  const startTimeStr = getTimeFromISO(startDate);

  const endTimeStr = getTimeFromISO(endDate);

  const examDuration = calculateExamDuration(startDate, endDate);

  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            { label: 'Graded Papers', href: '/marked-answerscript' },
            {
              label: 'Assessment Details',
              href: `/marked-answerscript/assessment/details/${params?.id ? params?.id : '1'}`,
            },
            {
              label: 'Subject Wise Assessment Details',
              href: `/marked-answerscript/assessment/subject-details/${params?.id}?grade_class=${gradeId}`,
            },
          ]}
        >
          Graded Papers
        </PageTitle>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-slate-500">General Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UILoader />
            ) : subjectDetails?.results?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Year</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.batch__start_year}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Grade</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.grade__grade_number}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Term</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.term__term_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Class</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.grade_class_names}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Assessment Name</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.assessment__assessment_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Subject Name</UIText>
                  </label>
                  <p>{subjectDetails?.results[0]?.subject__master_subject__subject_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Subject Code</UIText>
                  </label>
                  <p>{subjectDetails?.results[0]?.subject__master_subject__subject_code}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Date</UIText>
                  </label>
                  <p>{startDateStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Start Time</UIText>
                  </label>
                  <p>{startTimeStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>End Time</UIText>
                  </label>
                  <p>{endTimeStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Duration</UIText>
                  </label>
                  <p>{examDuration}</p>
                </div>
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
          <CardHeader>
            {/* <CardTitle className="text-slate-500 flex justify-between items-center">
              <div>Manual Review</div>
            </CardTitle> */}
            <CardTitle className="text-slate-500 flex justify-between">
              <p>
                <UIText>Marked Answer Script</UIText>
              </p>
              {/* <div className="flex gap-5">
                <Select value={value} onChange={handleChange} style={{ width: 200 }} placeholder="Select Order">
                  <option value={'created_at'}>Created At</option>
                  <option value={'updated_at'}>Updated At</option>
                </Select>
              </div> */}
            </CardTitle>
          </CardHeader>
          <div className="px-4">
            <DynamicTable
              className="pb-5"
              data={
                (Array.isArray(getSubjectWiseStudent?.results) &&
                  getSubjectWiseStudent?.results?.length > 0 &&
                  getSubjectWiseStudent?.results) ||
                []
              }
              columns={columns}
              loading={isLoading}
              totalCount={getSubjectWiseStudent?.totalCount || 0}
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
