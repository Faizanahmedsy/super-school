import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import UILoader from '@/components/custom/loaders/UILoader';
import { MainQuizDetailsResp } from '../../types/practice-exercises.types';

type QuizDetailsProps = {
  data: MainQuizDetailsResp | undefined;
  loading: boolean;
};

const QuizDetailView = ({ data, loading }: QuizDetailsProps) => {
  // HOOKS
  const navigate = useNavigate();
  // HELPER FUNCTIONS
  const isOptionCorrect = (option: string, actualAnswers: string[]): boolean => actualAnswers.includes(option);

  if (loading) return <UILoader />;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <div className="flex justify-center items-center">
                <UIText as="h3">Quiz Questions, Options and their correct answers</UIText>
              </div>
              <Button onClick={() => navigate(`/generate-quiz?editId=${data?.main_quiz?.id}`)}>Edit Quiz</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data?.quiz_qanda.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-lg">{index + 1}.</span>
                  <div className="space-y-4 flex-1">
                    <h3 className="font-medium text-lg">{question.question}</h3>
                    <div className="space-y-2 pl-4">
                      {question?.options &&
                        question?.options.map((option) => {
                          const correct = isOptionCorrect(option, question?.actual_answer);

                          return (
                            <div
                              key={option}
                              className={cn('flex items-center gap-3 p-2 rounded-md', correct && 'bg-green-50')}
                            >
                              {correct ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <X className="h-5 w-5 text-gray-400" />
                              )}
                              <span className={cn(correct ? 'text-green-700 font-medium' : 'text-gray-600')}>
                                {option}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizDetailView;
