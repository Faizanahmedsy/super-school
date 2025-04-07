import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import { dummyPdf } from '@/app/constants';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import { Modal } from 'antd';
import { useState } from 'react';

export default function MemosList() {
  const [showMemoModal, setShowMemoModal] = useState(false);

  const data = [
    {
      exam: 'Final Summer 2023',
      standard: 'Class 10',
      date: '11th July 2023',
      num: 1,
    },
    {
      exam: 'Final Summer 2023',
      standard: 'Class 9',
      date: '14th September 2023',
      num: 2,
    },
    {
      exam: 'Final Summer 2023',
      standard: 'Class 10',
      date: '24th July 2023',
      num: 3,
    },
    {
      exam: 'Midsem Summer 2023',
      standard: 'Class 10',
      date: '28th September 2023',
      num: 4,
    },
    {
      exam: 'Final Summer 2023',
      standard: 'Class 10',
      date: '2th September 2023',
      num: 5,
    },
  ];

  const columns = [
    {
      accessorKey: 'exam',
      header: 'Assessment',
    },
    {
      accessorKey: 'examType',
      header: 'Assessment Type',
    },
    {
      accessorKey: 'standard',
      header: 'Standard',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'institute',
      header: 'School',
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center">
          <TableViewBtn onClick={() => setShowMemoModal(true)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <AppPageMeta title="Results List" />
        <PageTitle>Memos List</PageTitle>
        <AppsContainer title={''} fullView={true} type="bottom">
          {data && <TanstackTable data={data} columns={columns} />}
        </AppsContainer>
      </div>

      <Modal open={showMemoModal} onCancel={() => setShowMemoModal(false)} title="Memo" width={800} className="">
        <object data={dummyPdf} type="application/pdf" width="100%" height="100%">
          <p>
            Unable to display PDF file. <a href={dummyPdf}>Download</a> instead.
          </p>
        </object>
      </Modal>
    </>
  );
}
