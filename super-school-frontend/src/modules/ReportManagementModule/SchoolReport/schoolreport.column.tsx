import { capitalizeFirstLetter } from '@/lib/common-functions';

export const schoolReportColumns: any = [
  {
    accessorKey: 'school_name',
    header: 'School Name',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'school_admins_count',
    header: 'School Admins Count',
  },
  {
    accessorKey: 'teachers_count',
    header: 'Teachers Count',
  },
  {
    accessorKey: 'learners_count',
    header: 'Learners Count',
  },
  {
    accessorKey: 'parents_count',
    header: 'Parents Count',
  },
  {
    accessorKey: 'total_subjects',
    header: 'Total Subject',
  },
  {
    accessorKey: 'total_assessments',
    header: 'Total Assessments',
  },
  {
    accessorKey: 'total_assessment_subjects',
    header: 'Total Assessment Subject',
  },
  {
    accessorKey: 'total_answersheets_uploaded',
    header: 'Total Answersheets Uploaded',
  },
  // {
  //   accessorKey: 'quiz_types',
  //   header: 'Total Quizzes',
  // },
  {
    accessorKey: 'total_events',
    header: 'Total Events',
  },
  {
    accessorKey: 'total_lesson_plans',
    header: 'Total Lesson Plans',
  },
];
