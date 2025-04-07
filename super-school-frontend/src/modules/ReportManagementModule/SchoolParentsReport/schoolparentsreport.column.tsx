import { capitalizeFirstLetter } from '@/lib/common-functions';
import React from 'react';

export const schoolParentsReportColumns: any = [
  {
    accessorKey: 'parent_name',
    header: 'Parent Name',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'parent_email',
    header: 'Email',
  },
  {
    accessorKey: 'parent_mobile',
    header: 'Mobile No',
  },
  {
    header: 'Learner Admission Number',
    cell: (info: any) => {
      const data = info.row.original;

      return (
        <span>
          {data?.learners
            ?.map((item: any) => item?.admission_no || '-')
            .map((admissionNo: number, index: number) => (
              <React.Fragment key={index}>
                {admissionNo}
                {index < data?.learners?.length - 1 && ','}
                <br />
              </React.Fragment>
            ))}
        </span>
      );
    },
  },
  {
    header: 'Learner Name',
    cell: (info: any) => {
      const data = info.row.original;

      return (
        <span>
          {data?.learners
            ?.map((item: any) => capitalizeFirstLetter(item?.name || '-'))
            .map((name: string, index: number) => (
              <React.Fragment key={index}>
                {name}
                {index < data?.learners?.length - 1 && ','}
                <br />
              </React.Fragment>
            ))}
        </span>
      );
    },
  },
];
