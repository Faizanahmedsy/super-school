import UILoader from '@/components/custom/loaders/UILoader';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { formatDate } from '@/lib/common-functions';
import { useExamtimetableDetailsGetById } from '@/services/examtimetable/examtimetable.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExamTimeTableDetail() {
  const subjectDetailsId = useGlobalState((state) => state.subjectDetailsId);
  const school_id = useRoleBasedSchoolId();
  const navigate = useNavigate();

  const params: any = useParams();
  const { data: getdatabyid, isLoading } = useExamtimetableDetailsGetById(params?.id);
  const startDate = new Date(getdatabyid?.assessment_start_datetime);
  const endDate = new Date(getdatabyid?.assessment_end_datetime);

  // Display formatted date and time
  const startDateStr = formatDate(startDate);

  const endDateStr = formatDate(endDate);
  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            {
              label: 'Exam Timetable List',
              href: '/assessment-timetable',
              onClick: () => {
                navigate('/assessment-timetable', { state: { key: '4' } });
              },
            },
            {
              label: 'Exam Details',
              href: `/exam-timetable/details/${subjectDetailsId?.subjectdetailsid?.id}`,
            },
          ]}
        >
          Exam Subject Details
        </PageTitle>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-slate-500">General Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UILoader />
            ) : getdatabyid ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[
                  { label: 'Year', value: getdatabyid?.batch?.start_year },
                  { label: 'Grade', value: getdatabyid?.grade?.grade_number },
                  { label: 'Term', value: getdatabyid?.term?.term_name },
                  { label: 'Class', value: getdatabyid?.division?.name },
                  { label: 'Exam Name', value: getdatabyid.assessment_name },
                  { label: 'Subject Name', value: getdatabyid?.subject?.master_subject?.subject_name },
                  { label: 'Subject Code', value: getdatabyid?.subject?.master_subject?.subject_code },
                  { label: 'Paper Title', value: getdatabyid?.paper_title },
                  { label: 'Date', value: dayjs(getdatabyid?.start_date).format('DD-MM-YYYY') },
                  { label: 'Start Time', value: getdatabyid?.start_time },
                  { label: 'End Time', value: getdatabyid?.end_time },
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

        {/* <Card>
          <div className="px-4">
            <DynamicTable
              data={Array.isArray(getdatabyid) ? getdatabyid || [] : []}
              columns={columns}
              loading={isLoading}
              totalCount={getdatabyid?.totalCount || 0}
              // searchColumn="school_name"
              // searchPlaceholder="Search by School Name / EMIS Number"
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
            />
          </div>
        </Card> */}
      </div>
    </>
  );
}
