import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { AlertCircle, CheckCircle2, ChevronLeftIcon, Trophy, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAttemptQuiz, useRetriveQuizDetails } from '../PracticeExercises/action/personalized-learning.action';
import BtnLoader from '@/components/custom/buttons/btn-loader';
import UILoader from '@/components/custom/loaders/UILoader';
import { displayError } from '@/lib/helpers/errorHelpers';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  actual_answers: string[];
  student_answers: string[] | null;
  multi_choice: boolean;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
  quiz: number;
  term: number;
  batch: number;
  school: number;
}

interface QuizResult {
  score: number;
  correctQuestions: number;
  totalQuestions: number;
  resultDetails: {
    questionId: number;
    questionText: string;
    selectedOptions: string[];
    correctOptions: string[];
    isCorrect: boolean;
  }[];
}

export default function AttendQuiz() {
  // HOOKS
  const navigate = useNavigate();
  const params = useParams();

  // QUERIES
  const quizSubmitMutation = useAttemptQuiz();
  const quizDetailsQuery = useRetriveQuizDetails(Number(params.id));

  const quiz_qanda = quizDetailsQuery.data?.quiz_qanda || [];

  // LOCAL STATES
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[][]>(Array(quiz_qanda.length).fill([]));
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Initialize selectedAnswers correctly when quiz_qanda is available
  useEffect(() => {
    if (quiz_qanda.length > 0) {
      setSelectedAnswers(Array(quiz_qanda.length).fill([]));
    }
  }, [quiz_qanda]);

  // FUNCTIONS
  const handleOptionToggle = (option: string) => {
    const currentSelectedOptions = selectedAnswers[currentQuestion] || []; // Ensure it's an array

    const newSelectedOptions = currentSelectedOptions.includes(option)
      ? currentSelectedOptions.filter((selectedOption: string) => selectedOption !== option)
      : [...currentSelectedOptions, option];

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = newSelectedOptions;
    setSelectedAnswers(newSelectedAnswers);
  };

  const moveToNextQuestion = () => {
    if (currentQuestion < quiz_qanda.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    // let correctQuestions = 0;
    // const resultDetails = quiz_qanda.map((question, index) => {
    //   const isCorrect =
    //     JSON.stringify(selectedAnswers[index].sort()) === JSON.stringify(question.actual_answers.sort());

    //   if (isCorrect) correctQuestions++;

    //   return {
    //     questionId: question.id,
    //     questionText: question.question,
    //     selectedOptions: selectedAnswers[index],
    //     correctOptions: question.actual_answers,
    //     isCorrect: isCorrect,
    //   };
    // });

    // const score = (correctQuestions / quiz_qanda.length) * 100;
    // TODO: Remove this later
    // setQuizResult({
    //   score,
    //   correctQuestions,
    //   totalQuestions: quiz_qanda.length,
    //   resultDetails,
    // });

    const formattedAnswers = quiz_qanda.map((question, index) => ({
      question_id: question.id,
      student_answers: selectedAnswers[index],
    }));

    const payload = {
      quiz_id: Number(params.id),
      answers: formattedAnswers,
    };

    quizSubmitMutation.mutate(payload, {
      onSuccess: (data) => {
        navigate(`/practice/quiz-details/student-answers/${data?.quiz_id}`);
        // setQuizCompleted(true);
        // setQuizResult({
        //   score,
        //   correctQuestions,
        //   totalQuestions: quiz_qanda.length,
        //   resultDetails,
        // });
        setSelectedAnswers(Array(quiz_qanda.length).fill([]));
      },
      onError: (error: any) => {
        console.error('Quiz Submission Error:', displayError(error?.response?.data?.error));
      },
    });
    // setQuizCompleted(true); // TODO: REMOVE LATER
  };

  if (quizCompleted && quizResult) {
    return (
      <div className="container mx-auto p-4">
        <PageTitle>Quiz Results</PageTitle>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                {quizResult.score >= 80 ? (
                  <Trophy className="w-8 h-8 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-500" />
                )}
                Quiz Completed
              </div>
              <Button
                size="sm"
                variant="nsc-secondary"
                onClick={() => {
                  setQuizCompleted(false);
                  setCurrentQuestion(0);
                  setSelectedAnswers(Array(quiz_qanda.length).fill([]));
                  setQuizResult(null);
                }}
              >
                Retry Quiz
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-bold">Score: {quizResult.score.toFixed(2)}%</p>
                <p className="text-lg">
                  {quizResult.correctQuestions} out of {quizResult.totalQuestions} questions correct
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Detailed Results</h3>
                {quizResult.resultDetails.map((result, index) => (
                  <Card
                    key={result.questionId}
                    className={`mb-4 ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {result.isCorrect ? (
                          <CheckCircle2 className="text-green-500 w-6 h-6" />
                        ) : (
                          <XCircle className="text-red-500 w-6 h-6" />
                        )}
                        <span className="font-semibold">Question {result.questionId}</span>
                      </div>

                      <p className="text-base font-medium">{result.questionText}</p>

                      <div className="space-y-2">
                        <p className="font-semibold">Your Answer:</p>
                        {quiz_qanda[index].options
                          .filter((option) => result.selectedOptions.includes(option))
                          .map((option) => (
                            <div
                              key={option}
                              className={`p-2 rounded ${
                                result.correctOptions.includes(option) ? 'bg-green-100' : 'bg-red-100'
                              }`}
                            >
                              {option}
                              {result.correctOptions.includes(option) ? (
                                <span className="text-green-600 ml-2">(Correct)</span>
                              ) : (
                                <span className="text-red-600 ml-2">(Incorrect)</span>
                              )}
                            </div>
                          ))}

                        {result.selectedOptions.length === 0 && <p className="text-red-600">No answer selected</p>}
                        {/* {!result.isCorrect && (
                          <div className="mt-2">
                            <p className="font-semibold">Correct Answer(s):</p>
                            {quizData.questions[index].options
                              .filter((option) => result.correctOptions.includes(option.id))
                              .map((option) => (
                                <div key={option.id} className="p-2 rounded bg-green-100 text-green-800">
                                  {option.text}
                                </div>
                              ))}
                          </div>
                        )} */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageTitle>Attempt Quiz</PageTitle>
      <Card className="w-full">
        <CardHeader className="relative z-10">
          <CardTitle className="flex justify-between items-center">
            <div>{quizDetailsQuery?.data?.quiz?.title}</div>
            <div className="flex justify-center items-center gap-4">
              <Button size="sm" variant="nsc-secondary" onClick={() => navigate('/practice?step=3')}>
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Subject: {quizDetailsQuery?.data?.quiz.subject_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                Question {currentQuestion + 1} of {quiz_qanda.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quizDetailsQuery.isPending ? (
                <UILoader />
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-lg font-medium">{quiz_qanda[currentQuestion]?.question}</p>
                    <div className="space-y-2">
                      {quiz_qanda[currentQuestion]?.options.map((option: any, index: number) => (
                        <div
                          key={option}
                          className="flex justify-between items-center space-x-2 p-2 hover:bg-gray-50 transition"
                        >
                          <div className="flex space-x-3 items-center">
                            <Checkbox
                              id={option}
                              checked={selectedAnswers[currentQuestion]?.includes(option)}
                              onCheckedChange={() => handleOptionToggle(option)}
                            />
                            <label
                              htmlFor={option}
                              className="text-sm leading-5 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex mt-4 justify-end gap-4">
                      <Button
                        variant="secondary"
                        className="bg-secondary text-primary"
                        onClick={moveToPreviousQuestion}
                        disabled={currentQuestion === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-secondary text-primary hover:none"
                        onClick={moveToNextQuestion}
                        disabled={currentQuestion === quiz_qanda.length - 1}
                      >
                        Next
                      </Button>
                      {currentQuestion === quiz_qanda.length - 1 && (
                        <Button
                          className="w-[150px]"
                          disabled={selectedAnswers.some((answers) => answers.length === 0)}
                          onClick={submitQuiz}
                        >
                          {quizSubmitMutation?.isPending ? (
                            <div className="flex">
                              <BtnLoader />
                              Submit Quiz
                            </div>
                          ) : (
                            <>Submit Quiz</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );
}
