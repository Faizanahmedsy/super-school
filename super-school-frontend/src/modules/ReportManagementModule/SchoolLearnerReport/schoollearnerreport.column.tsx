import { capitalizeFirstLetter } from '@/lib/common-functions';

export const schoolLearnersReportColumns: any = [
  {
    accessorKey: 'admission_no',
    header: 'Admission No',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'learner_name',
    header: 'Learner Name',
  },
  {
    accessorKey: 'learner_email',
    header: 'Email',
  },
  {
    accessorKey: 'learner_mobile',
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
  {
    header: 'Parent Name',
    cell: (info: any) => {
      const data = info.row.original;
      return (
        <span>
          {data?.parents?.map((item: any, index: number) => (
            <span key={index}>
              {item?.parent_name ? capitalizeFirstLetter(item?.parent_name) : '-'}
              <br />
            </span>
          ))}
        </span>
      );
    },
  },
  {
    accessorKey: 'parent_email',
    header: 'Parent Email',
    cell: (info: any) => {
      const data = info.row.original;
      return (
        <span>
          {data?.parents?.map((item: any, index: number) => (
            <span key={index}>
              {item?.parent_email ? item?.parent_email : '-'}
              <br />
            </span>
          ))}
        </span>
      );
    },
  },
  {
    accessorKey: 'parent_mobile',
    header: 'Parent Mobile',
    cell: (info: any) => {
      const data = info.row.original;
      return (
        <span>
          {data?.parents?.map((item: any) => {
            return item?.parent_mobile ? capitalizeFirstLetter(item?.parent_mobile) : '-';
          })}
        </span>
      );
    },
  },
];
