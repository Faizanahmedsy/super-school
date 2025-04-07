import { capitalizeFirstLetter } from '@/lib/common-functions';

export const schoolQuizReportColumns: any = [
  {
    accessorKey: 'quiz_title',
    header: 'Quiz Title',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'grade_class',
    header: 'Grade & Class',
    cell: (info: any) => {
      const grade_classes = info.getValue();
      return <span>{grade_classes ? grade_classes : '-'}</span>;
    },
  },
  {
    accessorKey: 'total_questions',
    header: 'Total Questions',
  },
  {
    accessorKey: 'students_assigned',
    header: 'Learner Assigned',
  },
  {
    accessorKey: 'students_completed',
    header: 'Learner Completed',
  },
  {
    accessorKey: 'students_not_completed',
    header: 'Learner Not Completed',
  },
  {
    accessorKey: 'total_marks_available',
    header: 'Total Marks Available',
  },
  {
    accessorKey: 'average_marks_obtained',
    header: 'Average Marks Obtained',
  },
];
