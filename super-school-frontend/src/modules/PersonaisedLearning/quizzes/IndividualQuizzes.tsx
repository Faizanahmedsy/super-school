import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, Trophy, XCircle } from 'lucide-react';
import * as React from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  color: string;
  lightColor: string;
}

const quizData: QuizQuestion[] = [
  {
    question: 'Who was Albert Einstein?',
    options: ['Theoretical physicist', 'Prime Minister', 'Wrestler', 'Soldier'],
    correctAnswer: '0',
    color: 'from-blue-500 to-blue-600',
    lightColor: 'bg-blue-50',
  },
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: '2',
    color: 'from-emerald-500 to-emerald-600',
    lightColor: 'bg-emerald-50',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: '1',
    color: 'from-violet-500 to-violet-600',
    lightColor: 'bg-violet-50',
  },
];

export default function ModernQuiz() {
  const [selectedAnswers, setSelectedAnswers] = React.useState<string[]>(Array(quizData.length).fill(''));
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [score, setScore] = React.useState<number>(0);

  const handleAnswerChange = (questionIndex: number, value: string): void => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = value;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = (): void => {
    const correctAnswers = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quizData[index].correctAnswer ? 1 : 0);
    }, 0);
    setScore(correctAnswers);
    setIsSubmitted(true);
  };

  const getScoreMessage = (): string => {
    const percentage = (score / quizData.length) * 100;
    if (percentage === 100) return 'Perfect Score! 🎉';
    if (percentage >= 80) return 'Great Job! 🌟';
    if (percentage >= 60) return 'Good Effort! 👍';
    return 'Keep Practicing! 💪';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pb-32">
        {/* Header */}

        {/* Quiz Questions */}
        <div className="space-y-6">
          {quizData.map((question, questionIndex) => (
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: questionIndex * 0.1 }}
            >
              <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg">
                <div className={`absolute inset-0 ${question.lightColor} opacity-40`} />

                <CardHeader className="relative z-[1] px-4 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`hidden sm:block p-3 rounded-lg ${question.lightColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Target className="w-6 h-6 text-gray-700" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800">
                      Question {questionIndex + 1}: {question.question}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="relative z-[1] px-4 sm:px-6">
                  <RadioGroup
                    value={selectedAnswers[questionIndex]}
                    onValueChange={(value: any) => handleAnswerChange(questionIndex, value as any)}
                    className="space-y-3"
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center p-3 rounded-lg transition-all duration-200
                          ${!isSubmitted && 'hover:bg-gray-50'}
                          ${isSubmitted && optionIndex.toString() === question.correctAnswer ? 'bg-green-50' : ''}
                          ${
                            isSubmitted &&
                            selectedAnswers[questionIndex] === optionIndex.toString() &&
                            selectedAnswers[questionIndex] !== question.correctAnswer
                              ? 'bg-red-50'
                              : ''
                          }`}
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`q${questionIndex}-option-${optionIndex}`}
                          disabled={isSubmitted}
                          className="border-2"
                        />
                        <label
                          htmlFor={`q${questionIndex}-option-${optionIndex}`}
                          className="ml-3 text-base sm:text-lg text-gray-700 cursor-pointer flex-grow"
                        >
                          {option}
                        </label>
                        {isSubmitted && optionIndex.toString() === question.correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
                        )}
                        {isSubmitted &&
                          selectedAnswers[questionIndex] === optionIndex.toString() &&
                          selectedAnswers[questionIndex] !== question.correctAnswer && (
                            <XCircle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
                          )}
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: quizData.length * 0.1 }}
          >
            {isSubmitted ? (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-500" />
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center sm:text-left">
                          {getScoreMessage()}
                        </h3>
                        <p className="text-gray-600 text-center sm:text-left">
                          You scored {score} out of {quizData.length}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setSelectedAnswers(Array(quizData.length).fill(''));
                        setScore(0);
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswers.some((answer) => answer === '')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
