import { capitalizeFirstLetter } from '@/lib/common-functions';

export const schoolTeachersReportColumns: any = [
  {
    accessorKey: 'school_name',
    header: 'School Name',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'teacher_name',
    header: 'Teacher Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'subjects',
    header: 'Subjects',
    cell: ({ row }: any) => {
      const subjects = row.getValue('subjects');
      const subjectList = subjects.split(',').map((subject: string) => subject.trim());

      return (
        <div>
          {subjectList.map((subject: string, index: number) => (
            <div key={index}>{subject},</div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'mobile',
    header: 'Mobile No',
  },
  {
    accessorKey: 'grades_classes',
    header: 'Grade & Class',
    cell: (info: any) => {
      const grade_classes = info.getValue();
      return <span>{grade_classes ? grade_classes : '-'}</span>;
    },
  },
];
