import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { QuizListData } from '../../types/practice-exercises.types';

type Props = {
  data: QuizListData | undefined;
};

export function TopPerformingLearners({ data }: Props) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <UIText as="h3">Top Performing Learners</UIText>
            <div>
              <Button variant={'nsc-secondary'} onClick={() => navigate('/practice/learner-list')}>
                Show All Learners
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of the top 5 learners and their quiz performance.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Learner First Name</TableHead>
              <TableHead className="w-[150px]">Learner Last Name</TableHead>
              <TableHead className="text-right">Marks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.results.quizzes.map((learner, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{learner.student_data.first_name}</TableCell>
                <TableCell className="font-medium">{learner.student_data.last_name}</TableCell>
                <TableCell className="text-right">{learner.marks_obtained}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
