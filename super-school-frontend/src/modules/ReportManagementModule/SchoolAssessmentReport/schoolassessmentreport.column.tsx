import { capitalizeFirstLetter } from '@/lib/common-functions';
import { cn } from '@/lib/utils';

export const schoolAssessmentReportColumns: any = [
  {
    accessorKey: 'assessment_name',
    header: 'Assessment Name',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'subjects',
    header: 'Subjects',
    cell: ({ row }: any) => {
      const subjects = row.getValue('subjects');
      return <div>{subjects?.map((subject: string, index: number) => <div key={index}>{subject},</div>)}</div>;
    },
  },
  {
    accessorKey: 'grade_classes',
    header: 'Grade & Class',
    cell: (info: any) => {
      const grade_classes = info.getValue();
      return <span>{grade_classes ? grade_classes : '-'}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info: any) => {
      return (
        <span
          className={cn(
            'px-2 py-1 rounded-full text-[12px] text-white',
            info.getValue() === 'completed' && '  bg-green-600',
            info.getValue() === 'upcoming' && '  bg-orange-600',
            info.getValue() === 'cancelled' && 'bg-red-600',
            info.getValue() === 'ongoing' && '  bg-blue-600'
          )}
        >
          {capitalizeFirstLetter(info.getValue())}
        </span>
      );
    },
  },
  {
    accessorKey: 'total_students',
    header: 'Total Learners',
  },
  {
    accessorKey: 'students_attended_all',
    header: 'Learner Attended All',
  },
  {
    accessorKey: 'students_not_attended_all',
    header: 'Learner Not Attended All',
  },
  {
    accessorKey: 'total_marks',
    header: 'Total Marks',
  },
  {
    accessorKey: 'average_marks',
    header: 'Average Marks',
  },
];
