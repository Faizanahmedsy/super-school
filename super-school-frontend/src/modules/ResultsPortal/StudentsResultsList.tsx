import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import { useNavigate } from 'react-router-dom';

export default function StudentsResultsList() {
  const navigate = useNavigate();

  const data = [
    {
      name: 'Jane Smith',
      result: 'Pass',
      num: 6,
      grade: 'C',
      exam: 'Final Summer 2023',
      standard: 'Class 10',
      date: '11th July 2023',
    },
    {
      name: 'Emily Johnson',
      result: 'Pass',
      num: 70,
      grade: 'A',
      exam: 'Final Summer 2023',
      standard: 'Class 9',
      date: '14th September 2023',
    },
    {
      name: 'Jane Smith',
      result: 'Fail',
      num: 53,
      grade: 'D',
      exam: 'Final Summer 2023',
      standard: 'Class 10',
      date: '24th July 2023',
    },
    {
      name: 'Sophia Williams',
      result: 'Fail',
      num: 8,
      grade: 'D',
      exam: 'Midsem Summer 2023',
      standard: 'Class 10',
      date: '28th September 2023',
    },
    {
      name: 'Emily Johnson',
      result: 'Fail',
      num: 41,
      grade: 'C',
      exam: 'Final Summer 2023',
      standard: 'Class 10',
      date: '2th September 2023',
    },
    {
      name: 'Chris Evans',
      result: 'Fail',
      num: 4,
      grade: 'B',
      exam: 'Final Summer 2023',
      standard: 'Class 7',
      date: '24th July 2023',
    },
    {
      name: 'Sophia Williams',
      result: 'Fail',
      num: 51,
      grade: 'D',
      exam: 'Final Summer 2023',
      standard: 'Class 9',
      date: '4th September 2023',
    },
    {
      name: 'Michael Brown',
      result: 'Fail',
      num: 92,
      grade: 'A',
      exam: 'Final Summer 2023',
      standard: 'Class 8',
      date: '8th July 2023',
    },
    {
      name: 'Emily Johnson',
      result: 'Fail',
      num: 76,
      grade: 'B',
      exam: 'Midsem Fall 2023',
      standard: 'Class 7',
      date: '16th July 2023',
    },
    {
      name: 'Sophia Williams',
      result: 'Pass',
      num: 92,
      grade: 'D',
      exam: 'Final Summer 2023',
      standard: 'Class 7',
      date: '25th July 2023',
    },
  ];

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: 'result',
      header: 'Result',
      cell: ({ row }: any) => <span>{row.original.result}</span>,
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }: any) => <span>{row.original.grade}</span>,
    },
    {
      accessorKey: 'exam',
      header: 'Assessment',
      cell: ({ row }: any) => <span>{row.original.exam}</span>,
    },
    {
      accessorKey: 'standard',
      header: 'Standard',
      cell: ({ row }: any) => <span>{row.original.standard}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => <span>{row.original.date}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex space-x-2">
          <TableViewBtn onClick={() => navigate(`/result/detail/${row.original.num}`)} />
          {/* <TableEditBtn onClick={() => ""} />
          <TableDeleteBtn onClick={() => ""} /> */}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AppPageMeta title="Results List" />
      <PageTitle>Results List</PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        {data && <TanstackTable data={data} columns={columns} />}
      </AppsContainer>
    </div>
  );
}
