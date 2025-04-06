import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ChevronLeftIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizType } from '../../types/practice-exercises.types';
import { useQuizList } from '../../action/personalized-learning.action';
import { QueryParams } from '@/services/types/params';

export default function QuizStudentList() {
  // HOOKS
  const navigate = useNavigate();

  // LOCAL STATES
  // const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState(1);

  // GLOBAL STATES
  const filterData = useGlobalState((state) => state.filterData);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
  });

  // QUERIES

  const allQuizListQuery = useQuizList({
    ...pageQuery,
    ordering: '-marks_obtained',
    subject: filterData?.subject?.id,
  });

  // FUNCTIONS
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
    }));
  };
  const handleSearchInputChange = () => {};

  // const studentStrengthWeakness = useStrengthsAndWeaknesses({});

  // const studentStrengthWeakness = [
  //   {
  //     student_name: 'Faizan',
  //     student_admission_number: '1',
  //     weakness: {
  //       subject_id: 1,
  //       subject_name: 'Math',
  //       strength: [
  //         'Problem-solving in algebra',
  //         'Understanding of geometry concepts',
  //         'Proficiency in arithmetic operations',
  //         'Strong grasp of basic calculus',
  //         'Good at logical reasoning and sequences',
  //       ],
  //       weakness: [
  //         'Trigonometric identities and equations',
  //         'Understanding complex numbers',
  //         'Probability and statistics',
  //         'Application of linear algebra',
  //         'Differential equations',
  //       ],
  //     },
  //   },
  // ];

  const columns: ColumnDef<QuizType>[] = [
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
        const badgeColor = type === 'ai' ? 'bg-blue-100 text-blue-800 uppercase' : 'bg-green-100 text-green-800';

        return <Badge className={badgeColor}>{type}</Badge>;
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
      accessorKey: 'subject',
      header: 'Subject',
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }: any) => <span>{row.original.duration}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'marks_obtained',
      header: 'Marks Obtained',
      cell: ({ row }: any) => {
        const { attempted, marks } = row.original;
        return attempted ? (
          <div className=" font-semibold">Marks: {marks}</div>
        ) : (
          <div className=" font-semibold">-</div>
        );
      },
    },
    {
      header: 'Attempt Status',
      cell: ({ row }: any) => {
        const { is_attempted, id } = row.original;
        return (
          <Button
            variant="nsc-secondary"
            onClick={() => navigate(`/practice/quiz/attend/${id}`)}
            disabled={is_attempted ? true : false}
          >
            Attend
          </Button>
        );
      },
    },
  ];

  // const summaryStats = [
  //   { label: 'Total Quizzes', value: '7' },
  //   { label: 'Auto Generated', value: '3' },
  //   { label: 'Manual', value: '4' },
  // ];

  return (
    <>
      <PageTitle>Quiz Learner List</PageTitle>
      <Card>
        <CardHeader className="relative z-10">
          <CardTitle className="">
            <div className="flex justify-between items-center">
              <UIText as="h3">List of Learners </UIText>
              <Button size="sm" variant="nsc-secondary" onClick={() => navigate(-1)}>
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </div>
            <Button
              size="sm"
              variant="nsc-secondary"
              className={cn(step === 1 && 'hidden')}
              onClick={() => {
                setStep(step - 1);
              }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicTable
            onSearchChange={handleSearchInputChange}
            data={allQuizListQuery?.data?.results?.quizzes ?? []}
            columns={columns as any}
            totalCount={allQuizListQuery.data?.totalCount ?? 0}
            searchPlaceholder="Search by Learner Name / ID"
            loading={false}
            pageSize={pageQuery.page_size}
            pageIndex={(pageQuery.page ?? 1) - 1}
            onPaginationChange={handlePaginationChange}
          />
        </CardContent>
      </Card>
    </>
  );
}
