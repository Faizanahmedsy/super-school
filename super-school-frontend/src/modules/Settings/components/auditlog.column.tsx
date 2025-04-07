import { capitalizeFirstLetter } from '@/lib/common-functions';
import dayjs from 'dayjs';

export const auditLogColumns: any = [
  {
    accessorKey: 'school_name',
    header: 'School Name',
    cell: (info: any) => {
      const schoolName = info.getValue();
      return <span>{schoolName ? capitalizeFirstLetter(schoolName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'role_name',
    header: 'Role Name',
  },
  {
    accessorKey: 'message',
    header: 'Message',
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: (info: any) => {
      const date = info.getValue();
      const formattedDate = dayjs(date).format('DD-MM-YYYY');
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Time',
    cell: (info: any) => {
      const date = info.getValue();
      const formattedDate = dayjs(date).format('hh:mm A');

      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'action',
    header: 'Action Performed',
    cell: (info: any) => {
      const action = info.getValue();

      // make badge for actions CREATE and UPDATE and DELETE

      let badgeColor = 'bg-green-100';
      if (action === 'DELETE') {
        badgeColor = 'bg-red-100';
      } else if (action === 'UPDATE') {
        badgeColor = 'bg-blue-100';
      }

      return <span className={`px-2 py-1 text-xs text-black ${badgeColor}`}>{action}</span>;
    },
  },
];
