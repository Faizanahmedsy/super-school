import { Card, CardHeader } from '@/components/ui/card';

import PageTitle from '@/components/global/PageTitle';

import { formatDate, formatDuration } from '@/lib/common-functions';
import { useAssessmentWiseStudentstDetails } from '@/services/assessments/assessments.hook';
import { Form } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MemoAndAnswerSheetTabContent from './MemoAndAnswerSheetTabContent';
import OCRScannedDataTabContent from './OCRScannedDataTabContent';
import UIText from '@/components/global/Text/UIText';
import UILoader from '@/components/custom/loaders/UILoader';

export default function ReviewAnswerSheet() {
  const [form] = Form.useForm();
  const location = useLocation();
  const title = window.location.pathname.split('/');
  const navigate = useNavigate();

  const { assessment_subject, grade_class } = location.state || {};
  // review - answesheet;
  const params: any = useParams<any>();
  const {
    data: getSubjectWiseStudent,
    refetch,
    isPending,
  } = useAssessmentWiseStudentstDetails(params?.id, {
    assessment_subject: assessment_subject,
    grade_class: grade_class,
  });

  const startDate: any = new Date(
    getSubjectWiseStudent && getSubjectWiseStudent[0]?.assessment_subject?.assessment_date
  );

  return (
    <>
      <PageTitle
        breadcrumbs={[
          ...(title.includes('manual-review')
            ? [
                {
                  label: 'Manual Review',
                  href: '/manual-review/',
                  onClick: () => {
                    navigate(-1);
                  },
                },
              ]
            : title.includes('marked-answerscript')
              ? [
                  {
                    label: 'Graded Papers',
                    href: '/marked-answerscript/',
                    onClick: () => {
                      navigate(-1);
                    },
                  },
                ]
              : [
                  {
                    label: 'Grading Process',
                    href: '/grading-process/',
                    onClick: () => {
                      navigate(-1);
                    },
                  },
                ]),
        ]}
      >
        Review Answer Sheet
      </PageTitle>
      <Card className="rounded-b-none pb-5">
        <CardHeader>
          {/* <CardTitle>Exam Details</CardTitle> */}
          {isPending ? (
            <div className="flex justify-center text-center w-100">
              <UILoader />
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold text-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-4">
                {Array.isArray(getSubjectWiseStudent) && getSubjectWiseStudent?.length > 0 ? (
                  <>
                    {[
                      {
                        label: 'Learner Name',
                        value: `${getSubjectWiseStudent[0]?.student?.first_name} ${getSubjectWiseStudent[0]?.student?.last_name}`,
                      },
                      { label: 'Admission Number', value: getSubjectWiseStudent[0]?.student?.admission_no },
                      { label: 'Year', value: getSubjectWiseStudent[0]?.batch?.name },
                      { label: 'Grade', value: getSubjectWiseStudent[0]?.grade?.name },
                      { label: 'Class', value: getSubjectWiseStudent[0]?.grade_class?.name },
                      {
                        label: 'Subject',
                        value: `${getSubjectWiseStudent[0]?.assessment_subject?.name} (${getSubjectWiseStudent[0]?.assessment_subject?.code})`,
                      },
                      { label: 'Assessment Date', value: formatDate(startDate) },
                      {
                        label: 'Assessment Duration',
                        value: formatDuration(getSubjectWiseStudent[0]?.assessment_subject?.duration),
                      },
                      {
                        label: 'AI Detected Marks',
                        value: `${getSubjectWiseStudent[0]?.obtained_mark}/${getSubjectWiseStudent[0]?.actual_mark}`,
                      },
                      { label: 'Paper Marks', value: getSubjectWiseStudent[0]?.paper_marks },
                      { label: 'Total Manual Count', value: getSubjectWiseStudent[0]?.questions_to_review },
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-1 items-start sm:items-center">
                        <span className="text-gray-500">
                          <UIText>{item.label}</UIText>
                        </span>
                        <span className="font-bold">: {item.value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-span-full text-center">No Details Found</div>
                )}
              </div>
            </>
          )}
        </CardHeader>
      </Card>
      <div className="flex">
        <div className="w-1/2 h-full">
          <MemoAndAnswerSheetTabContent
            answersheet={
              Array.isArray(getSubjectWiseStudent) &&
              getSubjectWiseStudent.length > 0 &&
              getSubjectWiseStudent[0].answer_sheet
            }
            memo={
              Array.isArray(getSubjectWiseStudent) &&
              getSubjectWiseStudent.length > 0 &&
              getSubjectWiseStudent[0].memorandom
            }
            questionpaper={
              Array.isArray(getSubjectWiseStudent) &&
              getSubjectWiseStudent.length > 0 &&
              getSubjectWiseStudent[0].question_paper
            }
          />
        </div>
        <OCRScannedDataTabContent
          form={form}
          assessment_id={assessment_subject}
          grade_class_id={grade_class}
          refetchData={refetch}
          studentDetails={
            Array.isArray(getSubjectWiseStudent) &&
            getSubjectWiseStudent.length > 0 &&
            getSubjectWiseStudent[0]?.assessment_subject?.name
          }
        />
      </div>
    </>
  );
}
