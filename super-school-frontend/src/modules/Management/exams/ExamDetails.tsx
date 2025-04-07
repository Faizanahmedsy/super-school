import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import UILoader from '@/components/custom/loaders/UILoader';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateExamDuration, formatDate, formatTime } from '@/lib/common-functions';
import { useSubjectDetailsList, useSubjectWiseStudents } from '@/services/assessments/assessments.hook';
import { QueryParams } from '@/services/types/params';
import { ColumnDef } from '@tanstack/react-table';
import { Modal } from 'antd';
import { AlertTriangle, BadgePlus } from 'lucide-react';
import { useState } from 'react';
import { MdOutlineNotificationsActive } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import BulkAnswerSheetUpload from './BulkAnswerSheetUpload';
import UploadAnswerSheetModal from './UploadAnswerSheetModal';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import UIText from '@/components/global/Text/UIText';

export default function ExamDetails() {
  const params: any = useParams();
  const [openAnswerSheetModal, setOpenAnswerSheetModal] = useState(false);
  const [openBulkAnswerSheetModal, setOpenBulkAnswerSheetModal] = useState(false);
  const [modalTrue, setModalTrue] = useState(false);
  const school_id = useRoleBasedSchoolId();

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    city_id: '',
    state_id: '',
    school_id: school_id ? school_id : undefined,
  });

  const { data: subjectDetails, isLoading } = useSubjectDetailsList({
    school_id: school_id ? school_id : undefined,
    id: params?.id,
  });

  // const batch_id: any = useRoleBasedCurrentBatch();
  // const grade_id = useGlobalState((state) => state.grade_id);
  // const term_id = useGlobalState((state) => state.term_id);
  // const division_id = useGlobalState((state) => state.division_id);

  const { data: getSubjectWiseStudent } = useSubjectWiseStudents({ school_id: school_id ? school_id : undefined });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const columns: ColumnDef<(typeof getSubjectWiseStudent)[0]>[] = [
    {
      accessorKey: 'profile_image',
      header: '',
      cell: (info) => <ProfileImageAvatar info={info} />,
    },
    {
      accessorKey: 'first_name',
      header: 'Name',
    },
    {
      accessorKey: 'last_name',
      header: 'Surname',
    },
    {
      accessorKey: 'addmission_no',
      header: 'Addmission No',
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="flex items-center space-x-2">
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
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button variant={'outline'} onClick={() => setOpenAnswerSheetModal(true)}>
            Upload Answer Sheet
          </Button>
        </div>
      ),
    },
  ];

  const ocrHandle = (): void => {
    setModalTrue(true);
  };

  const startDate: any = new Date(subjectDetails?.results[0]?.assessment_start_datetime);
  const endDate: any = new Date(subjectDetails?.results[0]?.assessment_end_datetime);

  const startDateStr = formatDate(startDate);
  const startTimeStr = formatTime(startDate);
  const endTimeStr = formatTime(endDate);

  const examDuration = calculateExamDuration(startDate, endDate);

  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            { label: 'Assessment List', href: '/assessments/list' },
            { label: 'Assessment Subject Details', href: `/assessment/details/${params?.id}` },
            { label: 'Assessment Students Details', href: `/exams/details/${params?.id}` },
          ]}
        >
          Assessment Details
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
                {[
                  { label: 'Year', value: subjectDetails?.results[0]?.batch__start_year },
                  { label: 'Grade', value: subjectDetails?.results[0]?.grade__grade_number },
                  { label: 'Term', value: subjectDetails?.results[0]?.term__term_name },
                  { label: 'Class', value: subjectDetails?.results[0]?.grade_class_names },
                  { label: 'Assessment Name', value: subjectDetails?.results[0]?.assessment__assessment_name },
                  { label: 'Subject Name', value: subjectDetails?.results[0]?.subject__master_subject__subject_name },
                  { label: 'Subject Code', value: subjectDetails?.results[0]?.subject__master_subject__subject_code },
                  { label: 'Date', value: startDateStr },
                  { label: 'Start Time', value: startTimeStr },
                  { label: 'End Time', value: endTimeStr },
                  { label: 'Duration', value: examDuration },
                ].map(({ label, value }, index) => (
                  <div key={index} className="bg-secondary shadow-md rounded-lg p-3">
                    <label className="text-sm text-muted-foreground">{label}</label>
                    <p className="mb-0">{value || 'N/A'}</p>
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
          <CardHeader>
            <CardTitle className="text-slate-500 flex justify-between">
              <p>Learner List</p>
              <div className="flex gap-5">
                <Button onClick={() => ocrHandle()} variant={'cust_01'}>
                  Start Digital Marking
                </Button>
                <UIPrimaryButton
                  onClick={() => setOpenBulkAnswerSheetModal(true)}
                  className="rounded-full"
                  icon={<BadgePlus size={18} />}
                >
                  Upload Bulk Answer Sheet
                </UIPrimaryButton>
              </div>
            </CardTitle>
          </CardHeader>
          <div className="p-4">
            <DynamicTable
              data={
                (Array.isArray(getSubjectWiseStudent) && getSubjectWiseStudent.length > 0 && getSubjectWiseStudent) ||
                []
              }
              columns={columns}
              totalCount={0}
              loading={isLoading}
              // searchColumn="school_name"
              // searchPlaceholder="Search by School Name / EMIS Number"
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
            />
          </div>
        </Card>
      </div>

      <UploadAnswerSheetModal open={openAnswerSheetModal} setOpen={setOpenAnswerSheetModal} />

      <BulkAnswerSheetUpload open={openBulkAnswerSheetModal} setOpen={setOpenBulkAnswerSheetModal} />

      <Modal
        open={modalTrue}
        onCancel={() => setModalTrue(false)}
        title="Start Digital Marking"
        centered
        // okButtonProps={{
        //   loading: deleteGradeMutation.isPending,
        // }}
        onOk={() => {
          // deleteGradeMutation.mutate(Number(deleteId), {
          //   onSuccess: () => {
          //     refetch();
          //     setModalTrue(false);
          //   },
          // });
        }}
      >
        <div className="space-y-2 mt-[30px]">
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                Please be aware that once the DIGITAL MARKING process begins, you will not be able to add or update any
                student's ANSWER-SHEET.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <MdOutlineNotificationsActive className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="mb-2">You will receive a notification once the DIGITAL MARKING process is completed.</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
