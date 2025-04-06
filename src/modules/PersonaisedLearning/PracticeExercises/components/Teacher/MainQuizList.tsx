import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTableFiltersV1 } from '@/hooks/table/use-table-filter-v1';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ChevronLeftIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuizData } from '../../types/practice-exercises.types';
import { useMainQuizList } from '../../action/personalized-learning.action';
import StatsBasedOnSubject from '../Analytics/StatsBasedOnSubject';
import QuizCountOverview from './QuizCountOverview';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedLearnerId } from '@/hooks/role-based-ids/use-rolebased-learner-id';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useState } from 'react';

export default function MainQuizList() {
  const batch_id = useRoleBasedCurrentBatch();
  const studentId = useRoleBasedLearnerId();
  const user = useGlobalState((state) => state.user);

  //Hooks
  const navigate = useNavigate();

  // API Calls and SELECT Options

  const { pageQuery, selectFilters, handlePaginationChange, handleSearchChange, selectedFilters } = useTableFiltersV1({
    enableBatchFilter: true,
    enableTermFilter: true,
    enableGradeFilter: true,
    enableClassFilter: true,
    enableSubjectFilter: true,
    onFiltersChange: (filters) => {},
  });

  const mainQuizListQuery = useMainQuizList({
    ...pageQuery,
    batch_id: batch_id,
    term: selectedFilters.term,
    grade: selectedFilters.grade,
    grade_class: selectedFilters.class,
    subject: selectedFilters.subject,
    quiz_type: ['ai', 'school'],
    ordering: '-created_at',
    ...(user?.role_name == ROLE_NAME.PARENT && {
      student_id: studentId ? studentId : undefined,
    }),
  });

  const quizzesData = mainQuizListQuery?.data?.results?.main_quizzes as QuizData[] | undefined;

  const columns: ColumnDef<QuizData>[] = [
    {
      accessorKey: 'subject',
      header: 'Subject',
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'quiz_topic',
      header: 'Quiz Topic',
      cell: ({ row }) => {
        return <div>{row?.original?.quiz_topic ? row?.original?.quiz_topic : '-'}</div>;
      },
    },
    {
      accessorKey: 'quiz_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.quiz_type;
        let badgeColor = 'bg-green-100 text-green-800';

        if (type === 'ai' || type === 'self') {
          badgeColor = 'bg-blue-100 text-blue-800 uppercase';
        }

        return <Badge className={badgeColor}>{type === 'ai' || type === 'self' ? 'AI' : 'Manual'}</Badge>;
      },
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date and Time',
      cell: ({ row }) => {
        return <div>{dayjs(row?.original?.start_date).format('DD MMM YYYY, hh:mm A')}</div>;
      },
    },
    {
      accessorKey: 'end_date',
      header: 'End Date and Time',
      cell: ({ row }) => {
        return <div>{dayjs(row?.original?.end_date).format('DD MMM YYYY, hh:mm A')}</div>;
      },
    },
    {
      accessorKey: 'average_marks',
      header: 'Average Marks',
    },
    {
      accessorKey: 'num_students',
      header: 'Total Students',
    },
    {
      accessorKey: 'num_attended_students',
      header: 'Students Attended',
    },
    {
      accessorKey: 'number_of_questions',
      header: 'Number of Questions',
    },

    {
      accessorKey: 'grade',
      header: 'Grade',
    },
    {
      accessorKey: 'grade_class',
      header: 'Class',
    },
    {
      header: 'Actions',
      cell: (info) => {
        return (
          <div className="flex space-x-2">
            <TableViewBtn onClick={() => navigate(`/practice/quiz-details/${info.row.original.id}`)} />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageTitle>Practice Exercises</PageTitle>

      <section className="space-y-4">
        <QuizCountOverview data={mainQuizListQuery?.data?.results} />
        <StatsBasedOnSubject type={'grade_class_based'} />
        <Card className="">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <UIText>List of Quizzes</UIText>
              <Button
                size="sm"
                variant="nsc-secondary"
                onClick={() => {
                  navigate('/practice');
                }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicTable
              data={quizzesData ?? []}
              columns={columns as any}
              totalCount={mainQuizListQuery?.data?.totalCount ?? 0}
              searchColumn="title"
              searchPlaceholder="Search by Title"
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              loading={mainQuizListQuery.isPending}
              onSearchChange={handleSearchChange}
              onPaginationChange={handlePaginationChange}
              selectFilters={selectFilters}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
