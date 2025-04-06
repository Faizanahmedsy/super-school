import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import TanstackTable from '@/components/global/CustomTable';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import PageTitle from '@/components/global/PageTitle';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { Exam } from '@/modules/Management/exams/examTypes';
import { Row } from '@tanstack/react-table';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ResultList = () => {
  const navigate = useNavigate();

  const handleEdit = (id: any) => {
    console.log('id: ' + id);
  };

  const handleDelete = (id: any) => {
    console.log('id: ' + id);
  };

  const columns: any = [
    {
      accessorKey: 'name',
      header: 'Exam Name',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<Exam> }) => (
        <div className="flex space-x-2">
          <TableViewBtn onClick={() => navigate('/exams/details')} />
          <TableEditBtn onClick={() => handleEdit(row.original.id)} />

          <TableDeleteBtn onClick={() => handleDelete(row.original.id)} />
        </div>
      ),
    },
  ];
  const data = [
    {
      name: '10th Std Maths Mid Sem Summer 2025',
      date: '10-10-2025',
    },
    {
      name: '10th Std Science Final Exam Winter 2025',
      date: '15-12-2025',
    },
    {
      name: '9th Std English Mid Sem Spring 2025',
      date: '05-03-2025',
    },
    {
      name: '8th Std History Final Exam Autumn 2025',
      date: '25-09-2025',
    },
    {
      name: '11th Std Physics Mid Sem Winter 2025',
      date: '20-11-2025',
    },
    {
      name: '11th Std Chemistry Final Exam Summer 2025',
      date: '30-06-2025',
    },
  ];
  return (
    <>
      <AppPageMeta title="Exams List" />
      <PageTitle
        extraItem={
          <Button
            // type="primary"
            onClick={() => navigate('/exams/add', { state: { key: 'add' } })}

            // htmlType="submit"
            // loading={}
          >
            Create Exam
          </Button>
        }
      >
        Exam List
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        {data && (
          <TanstackTable
            showSearchBar={true}
            // data={data?.list || []}
            data={data}
            columns={columns}
          />
        )}
      </AppsContainer>
    </>
  );
};

export default ResultList;
