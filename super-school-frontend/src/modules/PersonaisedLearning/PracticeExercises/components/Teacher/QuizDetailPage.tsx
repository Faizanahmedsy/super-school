import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ColumnDef } from '@tanstack/react-table';
import { Modal, Tabs } from 'antd';
import { CheckCircle, ChevronLeftIcon, GraduationCap, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizDetailView from './QuizDetailsQandA';

export default function QuizDetailPage() {
  // HOOKS
  const navigate = useNavigate();
  const params = useParams();

  // LOCAL STATES
  const [openModal, setOpenModal] = useState(false);
  const [enableLearnerListApi, setEnableLearnerListApi] = useState(false);
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
  });

  // QUERIES

  const quizDetailsQuery = useQuizDetails(Number(params.id));

  const quizListLearners = useQuizList(
    {
      main_quiz: Number(params.id),
    },
    enableLearnerListApi
  );

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

  const studentStrengthWeakness = [
    {
      student_name: 'Faizan',
      student_admission_number: '1',
      weakness: {
        subject_id: 1,
        subject_name: 'Math',
        strength: [
          'Problem-solving in algebra',
          'Understanding of geometry concepts',
          'Proficiency in arithmetic operations',
          'Strong grasp of basic calculus',
          'Good at logical reasoning and sequences',
        ],
        weakness: [
          'Trigonometric identities and equations',
          'Understanding complex numbers',
          'Probability and statistics',
          'Application of linear algebra',
          'Differential equations',
        ],
      },
    },
  ];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'student_data.admission_no',
      header: 'Admission No',
    },
    {
      accessorKey: 'student_data.first_name',
      header: 'First Name',
    },
    {
      accessorKey: 'student_data.last_name',
      header: 'Last Name',
    },
    {
      accessorKey: 'marks_obtained',
      header: 'Marks Obtained',
      cell: ({ row }: any) => {
        const marks = row.original.marks_obtained;
        return marks !== null ? marks : 'N/A';
      },
    },
    {
      accessorKey: 'is_attempted',
      header: 'Attempted',
      cell: ({ row }: any) => {
        const isAttempted = row.original.is_attempted;
        const badgeColor = isAttempted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <Badge className={badgeColor}>{isAttempted ? 'Yes' : 'No'}</Badge>;
      },
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => {
        const isAttempted = row.original.is_attempted;

        if (!isAttempted) {
          return (
            <>
              <Badge variant="secondary">Not Attempted</Badge>
            </>
          );
        }
        return (
          <>
            <TableViewBtn onClick={() => navigate(`/practice/quiz-details/student-answers/${row.original.id}`)} />
          </>
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
      <PageTitle
        extraItem={
          <>
            <Button size="sm" variant="nsc-secondary" onClick={() => navigate('/practice/quiz-list')}>
              <ChevronLeftIcon className="w-4 h-4" />
              Back
            </Button>
          </>
        }
      >
        Practice Exercises
      </PageTitle>
      <div className="space-y-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <UIText>Quiz Details</UIText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuizCard data={quizDetailsQuery?.data?.main_quiz as any} />
            <Tabs
              defaultActiveKey="1"
              className="py-5"
              items={[
                {
                  label: 'Question and Answers',
                  key: '1',
                  children: (
                    <>
                      <QuizDetailView data={quizDetailsQuery.data} loading={quizDetailsQuery?.isPending} />{' '}
                    </>
                  ),
                },
                {
                  label: (
                    <div className="">
                      <div className="flex items-center gap-2" onClick={() => setEnableLearnerListApi(true)}>
                        <UIText>List of Learners</UIText>
                      </div>
                    </div>
                  ),
                  key: '2',
                  children: (
                    <>
                      <Card>
                        <CardHeader className="relative z-10">
                          <CardTitle className="flex justify-between items-center">
                            <UIText>List of Learners</UIText>
                            <Button
                              size="sm"
                              variant="nsc-secondary"
                              onClick={() => {
                                navigate('/practice/quiz-list');
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
                            data={quizListLearners?.data?.results?.quizzes || []}
                            columns={columns as any}
                            totalCount={quizListLearners?.data?.totalCount || 0}
                            searchPlaceholder="Search by Learner Name / ID"
                            loading={quizListLearners?.isPending}
                            onPaginationChange={handlePaginationChange}
                            pageSize={pageQuery.page_size}
                            pageIndex={(pageQuery.page ?? 1) - 1}
                          />
                        </CardContent>
                      </Card>
                    </>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title="Quiz Details"
        footer={null}
        centered
        width={800}
      >
        <div className="p-6 max-w-3xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <h2 className="">Learner: {studentStrengthWeakness[0].student_name}</h2>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-lg py-1 px-4">
                ID: {studentStrengthWeakness[0].student_admission_number}
              </Badge>
              <Badge variant="secondary" className="text-lg py-1 px-4">
                Grade: 11
              </Badge>
              <Badge variant="secondary" className="text-lg py-1 px-4">
                Class: 11A
              </Badge>
              <Badge variant="secondary" className="text-lg py-1 px-4">
                Term: 3
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Strengths and Weaknesses Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-green-800">Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {studentStrengthWeakness[0].weakness.strength.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-700 text-sm leading-6">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses Card */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-semibold text-red-800">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-3">
                    {studentStrengthWeakness[0].weakness.weakness.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-700 text-sm leading-6">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Modal>
    </>
  );
}

import { Book, CalendarClock, CalendarDays, Clock } from 'lucide-react';
import { useQuizDetails, useQuizList } from '../../action/personalized-learning.action';
import { QueryParams } from '@/services/types/params';
import dayjs from 'dayjs';

const QuizCard = ({ data }: { data: any }) => {
  return (
    <Card className="p-6 mt-4 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Book className="w-4 h-4" />
            <span className="text-sm font-medium">Quiz Name</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 block">{data?.title ? data?.title : '-'}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Book className="w-4 h-4" />
            <span className="text-sm font-medium">Quiz Topic</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 block">{data?.quiz_topic ? data?.quiz_topic : '-'}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Subject</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 block">
            {data?.subject_name ? data?.subject_name : '-'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium">Grade</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 block">
            {data?.grade}
            {data?.grade_class}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-medium">Start Date</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 block">
            {dayjs(data?.quiz_start_date_time).format('DD-MM-YYYY hh:mm A')}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CalendarClock className="w-4 h-4" />
            <span className="text-sm font-medium">End Date</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 block">
            {dayjs(data?.quiz_end_date_time).format('DD-MM-YYYY hh:mm A')}
          </span>
        </div>
      </div>
    </Card>
  );
};
