import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ChevronLeftIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizList } from '../../action/personalized-learning.action';
import { QuizType } from '../../types/practice-exercises.types';
import StatsBasedOnSubject from '../Analytics/StatsBasedOnSubject';
import UIText from '@/components/global/Text/UIText';
import { Select } from 'antd';

export default function StudentQuizTable({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  // HOOKS
  const navigate = useNavigate();
  const [value, setValue] = useState<any>('');
  const filterData = useGlobalState((state) => state.filterData);

  // LOCAL STATES
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  // GLOBAL STATES

  // API CALLS

  // Below api will give the list of quizzes for this student
  const studentQuizListApi = useQuizList({
    ...pageQuery,
    ordering: '-created_at',
    // student: user?.id,
    subject: filterData?.subject?.id,
    quiz_type: value,
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const columns: ColumnDef<QuizType>[] = [
    {
      accessorKey: 'subject_name',
      header: 'Subject',
    },
    {
      accessorKey: 'title',
      header: 'Quiz Title',
      cell: ({ row }: any) => <span>{row.original.title}</span>,
    },
    {
      accessorKey: 'quiz_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.quiz_type;

        const badgeColor =
          type === 'ai'
            ? 'bg-blue-100 text-blue-800 uppercase'
            : type === 'self'
              ? 'bg-blue-100 text-blue-800 uppercase'
              : 'bg-green-100 text-green-800';

        const typeLabel = type === 'ai' ? 'AI' : type === 'self' ? 'AI' : 'Manual';

        return <Badge className={badgeColor}>{typeLabel}</Badge>;
      },
    },

    {
      accessorKey: 'number_of_questions',
      header: 'Number of Questions',
    },
    {
      accessorKey: 'quiz_start_date_time',
      header: 'Start Date',
      cell: ({ row }: any) => <span>{dayjs(row.original.quiz_start_date_time).format('DD-MM-YYYY hh:mm')}</span>,
    },
    {
      accessorKey: 'quiz_end_date_time',
      header: 'End Date',
      cell: ({ row }: any) => <span>{dayjs(row.original.quiz_end_date_time).format('DD-MM-YYYY hh:mm')}</span>,
    },

    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }: any) => <span>{row.original.duration}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue(); // Get the current status value
        let badgeClass = '';
        let text = '';

        switch (status) {
          case 'ended':
            badgeClass = 'bg-red-100 text-red-800'; // Red badge
            text = 'Ended';
            break;
          case 'ongoing':
            badgeClass = 'bg-green-100 text-green-800'; // Green badge
            text = 'Ongoing';
            break;
          case 'upcoming':
            badgeClass = 'bg-blue-100 text-blue-800'; // Blue badge
            text = 'Upcoming';
            break;
          default:
            badgeClass = 'bg-gray-100 text-gray-800'; // Default badge
            text = 'Unknown';
        }

        return <Badge className={cn(badgeClass, 'rounded-full')}>{text}</Badge>;
      },
    },

    {
      accessorKey: 'marks_obtained',
      header: 'Marks Obtained',
      cell: ({ row }: any) => {
        const { is_attempted, marks_obtained } = row.original;
        return is_attempted ? (
          <div className=" font-semibold">{marks_obtained}</div>
        ) : (
          <div className=" font-semibold">-</div>
        );
      },
    },
    {
      accessorKey: 'class_rank',
      header: 'Class Rank',
      cell: ({ row }: any) => {
        const { class_rank, quiz_type } = row.original;
        return quiz_type !== 'self' ? (
          <div className=" font-semibold">{class_rank}</div>
        ) : (
          <div className=" font-semibold">-</div>
        );
      },
    },
    {
      accessorKey: 'grade_rank',
      header: 'Grade Rank',
      cell: ({ row }: any) => {
        const { grade_rank, quiz_type } = row.original;
        return quiz_type !== 'self' ? (
          <div className=" font-semibold">{grade_rank}</div>
        ) : (
          <div className=" font-semibold">-</div>
        );
      },
    },
    {
      header: 'Action',
      cell: ({ row }: any) => {
        const { id, status, is_attempted } = row.original;
        return (
          <div className="flex justify-center items-center">
            {is_attempted ? (
              <TableViewBtn onClick={() => handleDetails(id)} />
            ) : (
              <>
                {!is_attempted && status == 'ended' ? (
                  <>
                    <Button
                      variant="nsc-secondary"
                      onClick={() => navigate(`/practice/quiz/attend/${id}`)}
                      disabled={status == 'ended' ? true : false}
                    >
                      Not Attended
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="nsc-secondary"
                      onClick={() => navigate(`/practice/quiz/attend/${id}`)}
                      disabled={status == 'ended' ? true : false}
                    >
                      Attend
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setValue('self');
  }, [setValue]);

  const handleDetails = (id: number) => {
    navigate(`/practice/quiz-details/student-answers/${id}`);
  };

  const handleChange = (newValue: string) => {
    if (newValue === 'ai' || newValue === 'school') {
      setValue(['ai', 'school']);
    } else {
      setValue(newValue);
    }
  };

  return (
    <div className="w-full p-1">
      <StatsBasedOnSubject />
      <Card className="w-full">
        <CardHeader className="relative z-10">
          <CardTitle className="flex justify-between items-center">
            <div>Your Quizzes</div>
            <div className="flex justify-center items-center gap-4">
              <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </div>
          </CardTitle>
          <CardDescription>You can attend or view your quizzes here.</CardDescription>
          <div className="p-4 flex items-center">
            <Select value={value} onChange={handleChange} style={{ width: 250 }} placeholder="Select Order">
              <option value="self">
                <UIText>Quizzes Generated Yourself</UIText>
              </option>
              <option value="ai">
                <UIText>Quizzes Assigned by Teacher</UIText>
              </option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicTable
            data={studentQuizListApi?.data?.results?.quizzes ?? []}
            columns={columns}
            totalCount={studentQuizListApi?.data?.totalCount ?? 0}
            onPaginationChange={handlePaginationChange}
            pageSize={pageQuery.limit}
            pageIndex={(pageQuery.page ?? 1) - 1}
            loading={studentQuizListApi?.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
