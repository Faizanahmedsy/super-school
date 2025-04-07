import PageTitle from '@/components/global/PageTitle';
import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
import { CheckCircle2, ChevronLeftIcon, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRetriveQuizDetails } from '../../action/personalized-learning.action';
import UILoader from '@/components/custom/loaders/UILoader';
import { useEffect, useState } from 'react';

export default function QuizStudentAnswersDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const [quiz_qanda, setQuizQandA] = useState<any[]>([]);

  const studentDetail = useRetriveQuizDetails(Number(params.id));

  const quiz = studentDetail?.data?.quiz;

  useEffect(() => {
    if (studentDetail?.data?.quiz_qanda) {
      const quiz_qanda = studentDetail?.data?.quiz_qanda;
      setQuizQandA(quiz_qanda);
    }
  }, [studentDetail?.data?.quiz_qanda]);

  return (
    <>
      <PageTitle>Learner's Quiz Results</PageTitle>
      <Card className="w-full">
        <CardHeader className="border-b-2 pb-4 mb-4">
          <CardTitle className="text-lg font-bold mb-4">
            <div className="flex items-center justify-between">
              <UIText as="h3">Learner Details</UIText>
              <Button
                size="sm"
                variant="nsc-secondary"
                onClick={() => {
                  setQuizQandA([]);
                  navigate('/practice');
                }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </div>
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Learner Name</span>
              <span className="text-base font-semibold text-gray-800">
                {quiz?.student_data?.first_name} {quiz?.student_data?.last_name}
              </span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Subject</span>
              <span className="text-base font-semibold text-gray-800">
                <RenderNullableValue value={quiz?.subject_name} />
              </span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Quiz Name</span>
              <span className="text-base font-semibold text-gray-800">{quiz?.title}</span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Quiz Topic</span>
              <span className="text-base font-semibold text-gray-800">{quiz?.quiz_topic}</span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Quiz Type</span>
              <span className="text-base font-semibold text-gray-800">
                {quiz?.quiz_type === 'ai' ? 'AI' : quiz?.quiz_type === 'self' ? 'AI' : 'Manual'}
              </span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Batch</span>
              <span className="text-base font-semibold text-gray-800">{quiz?.batch_name}</span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Grade & Class</span>
              <span className="text-base font-semibold text-gray-800">
                {quiz?.grade_number} {quiz?.grade_class_name}
              </span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Term</span>
              <span className="text-base font-semibold text-gray-800">{quiz?.term_name}</span>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">Start Date and Time</span>
              <span className="text-base font-semibold text-gray-800">
                {dayjs(quiz?.quiz_start_date_time).format('DD-MM-YYYY hh:mm')}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">End Date and Time</span>
              <span className="text-base font-semibold text-gray-800">
                {dayjs(quiz?.quiz_end_date_time).format('DD-MM-YYYY hh:mm')}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-bold">Score: {quiz?.marks_obtained}</p>
              <p className="text-lg">
                {quiz?.marks_obtained || 0} out of {quiz?.number_of_questions} questions correct
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Detailed Results</h3>
              {studentDetail?.isPending ? (
                <UILoader />
              ) : (
                <>
                  {/* {quiz_qanda &&
                    quiz_qanda?.length > 0 &&
                    quiz_qanda?.map((result, index) => (
                      <Card
                        key={result?.id}
                        className={`mb-4 ${result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            {result?.is_correct ? (
                              <CheckCircle2 className="text-green-500 w-6 h-6" />
                            ) : (
                              <XCircle className="text-red-500 w-6 h-6" />
                            )}
                            <span className="font-semibold">Question {index + 1}</span>
                          </div>

                          <p className="text-base font-medium">{result?.question}</p>

                          <div className="space-y-2">
                            <p className="font-semibold">Your Answer:</p>
                            {result?.options.map((option: any) => (
                              <div
                                key={option}
                                className={`p-2 rounded ${
                                  result?.student_answers?.includes(option)
                                    ? result?.is_correct
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))} */}

                  {/* {quiz_qanda &&
                    quiz_qanda?.length > 0 &&
                    quiz_qanda?.map((result, index) => (
                      <Card
                        key={result?.id}
                        className={`mb-4 ${result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            {result?.is_correct ? (
                              <CheckCircle2 className="text-green-500 w-6 h-6" />
                            ) : (
                              <XCircle className="text-red-500 w-6 h-6" />
                            )}
                            <span className="font-semibold">Question {index + 1}</span>
                          </div>

                          <p className="text-base font-medium">{result?.question}</p>

                          <div className="space-y-2">
                            <p className="font-semibold">Your Answer:</p>
                            {result?.options.map((option: string) => {
                              const isActualAnswer = result?.actual_answers.includes(option);
                              const isStudentAnswer = result?.student_answers.includes(option);

                              let bgColor = 'bg-gray-100';
                              let borderColor = '';

                              if (result?.multi_choice) {
                                if (isStudentAnswer) {
                                  bgColor = isActualAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                                  if (isActualAnswer) borderColor = 'border-2 border-red-500';
                                } else if (isActualAnswer) {
                                  bgColor = 'bg-green-100 text-green-700';
                                }
                              } else {
                                if (isActualAnswer) {
                                  bgColor = 'bg-green-100 text-green-700';
                                  if (isStudentAnswer) borderColor = 'border-2 border-red-500';
                                } else if (isStudentAnswer && !isActualAnswer) {
                                  bgColor = 'bg-red-100 text-red-700';
                                  borderColor = 'border-2 border-red-500';
                                } else if (isStudentAnswer && isActualAnswer) {
                                  bgColor = 'bg-green-100 text-green-700';
                                  borderColor = 'border-2 border-red-500';
                                }
                              }

                              return (
                                <div key={option} className={`p-2 rounded ${bgColor} ${borderColor}`}>
                                  {option}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))} */}

                  {quiz_qanda &&
                    quiz_qanda?.length > 0 &&
                    quiz_qanda?.map((result, index) => (
                      <Card
                        key={result?.id}
                        className={`mb-4 ${result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            {result?.is_correct ? (
                              <CheckCircle2 className="text-green-500 w-6 h-6" />
                            ) : (
                              <XCircle className="text-red-500 w-6 h-6" />
                            )}
                            <span className="font-semibold">Question {index + 1}</span>
                          </div>

                          <p className="text-base font-medium">{result?.question}</p>

                          <div className="space-y-2">
                            <p className="font-semibold">Your Answer:</p>
                            {result?.options.map((option: string) => {
                              const isActualAnswer = result?.actual_answers?.includes(option);
                              const isStudentAnswer = result?.student_answers?.includes(option);

                              let bgColor = 'bg-gray-100';
                              let borderColor = '';

                              if (isStudentAnswer) {
                                if (isActualAnswer) {
                                  bgColor = 'bg-green-100 text-green-700';
                                  borderColor = 'border-2 border-red-500';
                                } else {
                                  bgColor = 'bg-red-100 text-red-700';
                                  borderColor = 'border-2 border-red-500';
                                }
                              } else if (isActualAnswer) {
                                bgColor = 'bg-green-100 text-green-700';
                              }

                              return (
                                <div key={option} className={`p-2 rounded ${bgColor} ${borderColor}`}>
                                  {option}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
