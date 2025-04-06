import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import UILoader from '@/components/custom/loaders/UILoader';
import DownloadAnswersheetBtn from '@/components/global/DownloadAnswersheet/DownloadAnswersheetBtn';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDuration } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useAssessmentWiseStudentstDetails } from '@/services/assessments/assessments.hook';
import { VITE_SCHOOL_LOGO_URL } from '@/services/endpoints';
import { useFinalSubmitReviewData } from '@/services/manualReview/manualReview.action';
import useGlobalState from '@/store';
import { Form, Input, Modal } from 'antd';
import { AlertTriangle, CheckCircle2, Lock, XCircle } from 'lucide-react';
import { log } from 'node:console';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MarkedAnswerSheetPdf = ({
  data,
  setOpenPreviewModal,
  assessment_id,
  grade_class_id,
  isLocked,
  refetch,
  isPending,
}: any) => {
  const params: any = useParams<any>();
  const logoUrl = VITE_SCHOOL_LOGO_URL;
  const user = useGlobalState((state) => state.user);

  const navigate = useNavigate();
  const { data: getSubjectWiseStudent } = useAssessmentWiseStudentstDetails(params?.id, {
    assessment_subject: assessment_id,
    grade_class: grade_class_id ? grade_class_id : undefined,
  });

  const submitData = useFinalSubmitReviewData();

  const [isLoading, setIsLoading] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);

  const getMarkIcon = (gainedMarks: number, totalMarks: number) => {
    if (gainedMarks == 0) {
      return <XCircle className="text-red-500 h-5 w-5" />;
    } else if (gainedMarks == totalMarks) {
      return <CheckCircle2 className="text-green-500 h-5 w-5" />;
    } else {
      return <CheckCircle2 className="text-yellow-500 h-5 w-5" />;
    }
  };

  const startDate = new Date(getSubjectWiseStudent && getSubjectWiseStudent[0]?.assessment_subject?.assessment_date);

  const handleSubmit = () => {
    const payload = {
      student_answer_sheet_id: params?.id,
    };
    submitData.mutate(payload, {
      onSuccess: () => {
        setOpenPreviewModal(false);
        refetch();
        navigate(-1);
      },
    });
  };

  const handleCancel = () => {
    setOpenPreviewModal(false);
  };

  const showConfirmModal = () => {
    Modal.confirm({
      title: (
        <div className="flex items-center">
          <AlertTriangle className="text-2xl text-yellow-500 mr-2" />
          <span className="font-bold text-lg">Confirmation</span>
        </div>
      ),
      content: (
        <div className="space-y-2">
          <p>Are you sure you want to proceed?</p>
          <div className="flex items-center text-red-600">
            <strong>
              Warning: Once this action is performed, you will no longer be able to make any changes to the student's
              answer sheet or marks.
            </strong>
          </div>
        </div>
      ),
      centered: true,
      icon: null,
      okText: (
        <div className="flex items-center">
          Submit
          {/* {remainingTime > 0 && <span className="ml-2 text-gray-500">({remainingTime}s)</span>} */}
        </div>
      ),
      okButtonProps: {
        loading: isLoading,
        disabled: isLocked,
        className: 'hover:!bg-green-500 hover:!border-green-500 hover:!text-white transition-all duration-300',
      },
      cancelButtonProps: {
        className: 'hover:!border-red-500 hover:!text-red-500 transition-all duration-300',
      },
      onOk: async () => {
        setIsLoading(true);
        try {
          await handleSubmit();
        } catch (error) {
          console.error('Submission error:', error);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const studentsName = `${getSubjectWiseStudent[0]?.student?.first_name}_${getSubjectWiseStudent[0]?.student?.last_name}`;

  const uniqueStrengthTags = [...new Set(data.flatMap((item: any) => item.strength_tags))];

  const uniqueWeaknessTags = [...new Set(data.flatMap((item: any) => item.weakness_tags))];

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex justify-end gap-4 mb-5">
          {isLocked && (
            <DownloadAnswersheetBtn
              apiEndPoint={`student-answersheet/download/`}
              answersheetId={params?.id}
              studentName={studentsName.toLowerCase()}
            />
          )}
        </div>
        <Card ref={sheetRef}>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center mb-3">
              {getSubjectWiseStudent[0]?.school_logo && (
                <>
                  <img
                    src={`${logoUrl}${getSubjectWiseStudent[0]?.school_logo}`}
                    alt="logo"
                    style={{ maxHeight: '150px', maxWidth: '150px' }}
                  />
                </>
              )}

              <CardTitle className="text-2xl">
                <UIText>Marked Answer Sheet</UIText>
              </CardTitle>
            </div>
            <div className="text-sm font-semibold text-gray-700 grid grid-cols-2 gap-4">
              {Array.isArray(getSubjectWiseStudent) && getSubjectWiseStudent?.length > 0 ? (
                <>
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Learner Name</UIText>
                    </span>
                    <span className="font-bold">
                      : {''}
                      {`${getSubjectWiseStudent[0]?.student?.first_name} ${getSubjectWiseStudent[0]?.student?.last_name}`}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Admission Number</UIText>
                    </span>
                    <span className=" font-bold">
                      : {''}
                      {getSubjectWiseStudent[0]?.student?.admission_no}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Year</UIText>{' '}
                    </span>
                    <span className=" font-bold">
                      : {''}
                      {getSubjectWiseStudent[0]?.batch?.name}
                    </span>
                  </div>
                  {/* <div>Term: {getSubjectWiseStudent[0]?.student?.admission_no}</div> */}
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Grade</UIText>
                    </span>
                    <span className="font-bold">
                      {getSubjectWiseStudent[0]?.grade?.name}
                      {getSubjectWiseStudent[0]?.grade_class?.name}
                    </span>
                  </div>
                  {/* <div>
                    <span className="text-gray-500">Class: </span>
                    <span className=" font-bold"></span>
                  </div> */}
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Subject</UIText>
                    </span>
                    <span className=" font-bold">
                      : {''}
                      {`${getSubjectWiseStudent[0]?.assessment_subject?.name} (${getSubjectWiseStudent[0]?.assessment_subject?.code})`}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Assessment Date</UIText>
                    </span>
                    <span className=" font-bold">
                      : {''}
                      {formatDate(startDate)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">Assessment Duration</span>
                    <span className="font-bold">
                      : {''}
                      {formatDuration(getSubjectWiseStudent[0]?.assessment_subject?.duration)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">
                      <UIText>Total Score</UIText>
                    </span>
                    <span className=" font-bold">
                      : {''}
                      {`${getSubjectWiseStudent[0]?.obtained_mark}/${getSubjectWiseStudent[0]?.paper_marks}`}
                    </span>
                  </div>
                </>
              ) : (
                'No Details Found'
              )}
            </div>
            <div className="flex gap-4  text-sm text-gray-600 pb-4">
              <div className="flex items-center gap-1 mt-5">
                <CheckCircle2 className="text-green-500 h-4 w-4" />
                <UIText>Full Marks</UIText>
              </div>
              <div className="flex items-center gap-1 mt-5">
                <CheckCircle2 className="text-yellow-500 h-4 w-4" />
                <UIText>Partial Marks</UIText>
              </div>
              <div className="flex items-center gap-1 mt-5">
                <XCircle className="text-red-500 h-4 w-4" />
                <UIText>Zero Marks</UIText>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div>
              {isPending ? (
                <>
                  <UILoader />
                </>
              ) : (
                <>
                  {Array.isArray(data) &&
                    data.map((item, index) => (
                      <div key={index} className="mb-8 last:mb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-lg flex justify-center items-center gap-4">
                                <UIText>Question</UIText> {item?.question_number}
                                {getMarkIcon(
                                  item?.obtained_manual_mark != null ? item?.obtained_manual_mark : item?.obtained_mark,
                                  item.actual_mark
                                )}
                              </h3>
                              <p className="font-medium text-blue-50 rounded-full bg-blue-400 px-2 py-1">
                                {item?.obtained_manual_mark != null ? item?.obtained_manual_mark : item?.obtained_mark}/
                                {item.actual_mark}
                              </p>
                            </div>
                            <p className="text-gray-800 mb-2">{item.question}</p>
                            <div className="bg-gray-50 p-3 rounded-md mb-2">
                              <p className="text-gray-600 font-medium mb-1">
                                <UIText>Learner's Answer:</UIText>
                              </p>
                              <p className="text-gray-800">{item.answer}</p>
                            </div>
                            {item.teacher_reason && (
                              <>
                                <div className="bg-slate-100 p-3 rounded-md">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-slate-800">
                                      <UIText>Teacher Comment:</UIText>
                                    </p>
                                  </div>
                                  <p className="text-slate-700">{item.teacher_reason}</p>
                                </div>
                              </>
                            )}
                            <div className="bg-blue-50 p-3 rounded-md">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-blue-800">
                                  <UIText>AI Comment:</UIText>
                                </p>
                              </div>
                              <p className="text-blue-700">{item.reason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
            <div>
              {Array.isArray(getSubjectWiseStudent) && getSubjectWiseStudent?.length > 0 && (
                <div className="mt-5">
                  <span className="font-semibold text-lg flex justify-start items-center">
                    <UIText>Feedback:</UIText>
                  </span>
                  <p>{getSubjectWiseStudent[0]?.feedback}</p>
                </div>
              )}
            </div>
            <div className="flex w-full">
              {/* Strengths Section */}
              <div className="w-1/2 border-r border-gray-300 p-2">
                {Array.isArray(uniqueStrengthTags) && uniqueStrengthTags.length > 0 && (
                  <div>
                    <span className="font-semibold text-lg flex items-center">
                      <UIText>Strengths:</UIText>
                    </span>
                    <div className="max-h-[250px] overflow-auto scroll-area">
                      {uniqueStrengthTags.map((tag: any, index) => (
                        <div key={index} className="mt-1 bg-green-100 text-green-800 rounded-md">
                          <p className="p-2">{tag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Weaknesses Section */}
              <div className="w-1/2 p-2">
                {Array.isArray(uniqueWeaknessTags) && uniqueWeaknessTags.length > 0 && (
                  <div>
                    <span className="font-semibold text-lg flex items-center">
                      <UIText>Weaknesses:</UIText>
                    </span>
                    <div className="max-h-[250px] overflow-auto scroll-area">
                      {uniqueWeaknessTags.map((tag: any, index) => (
                        <div key={index} className="mt-1 bg-red-100 text-red-800  rounded-md">
                          <p className="p-2">{tag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="py-4 flex justify-end space-x-4">
          <Button onClick={handleCancel} type="button">
            <UIText>Cancel</UIText>
          </Button>
          {(user?.role_name == ROLE_NAME.TEACHER || user?.role_name == ROLE_NAME.ADMIN) && (
            <>
              <UIFormSubmitButton disabled={isLocked} api={submitData} onClick={showConfirmModal}>
                Final Submit
              </UIFormSubmitButton>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MarkedAnswerSheetPdf;
