import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export default function QuizCountOverview({ data }: any) {
  return (
    <Card className="w-full">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          <UIText>Overview</UIText>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <div className="grid grid-cols-3">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-2xl font-bold">
              {data?.overview?.num_of_generated ? data?.overview?.num_of_generated : '-'}
            </div>
            <UIText>Quizzes Generated</UIText>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-2xl font-bold">
              {data?.overview?.num_of_completed ? data?.overview?.num_of_completed : '-'}
            </div>
            <UIText>Quizzes Completed</UIText>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-2xl font-bold">
              {data?.overview?.average_marks ? data?.overview?.average_marks : '-'}
            </div>
            <UIText>Average Marks</UIText>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
