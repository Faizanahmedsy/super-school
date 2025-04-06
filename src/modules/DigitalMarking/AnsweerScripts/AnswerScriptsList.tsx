import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import { dummyPdf } from '@/app/constants';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import { Modal } from 'antd';
import { useState } from 'react';

export default function AnswerScriptsList() {
  const [showAnswerSheetModal, setShowAnswerSheetModal] = useState(false);

  const columns = [
    {
      accessorKey: 'studentName',
      header: 'Learner Name',
    },
    {
      accessorKey: 'exam',
      header: 'Assessment',
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
          <TableViewBtn onClick={() => setShowAnswerSheetModal(true)} />
        </div>
      ),
    },
  ];

  const data = [
    {
      studentName: 'Emily Doe',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Ankur School',
    },
    {
      studentName: 'Lucas Smith',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Bright Future High School',
    },
    {
      studentName: 'Sophia Brown',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Green Valley School',
    },
    {
      studentName: 'Mia Johnson',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Sunrise International',
    },
    {
      studentName: 'Liam Wilson',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Ankur School',
    },
    {
      studentName: 'Ava Davis',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Bright Future High School',
    },
    {
      studentName: 'Benjamin Williams',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Green Valley School',
    },
    {
      studentName: 'Lucas Martinez',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Sunrise International',
    },
    {
      studentName: 'Elijah Garcia',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Ankur School',
    },
    {
      studentName: 'Isabella Thompson',
      exam: '11th Midsem Summer 2024',
      date: '15-06-2024',
      institute: 'Bright Future High School',
    },
  ];

  return (
    <>
      <div>
        <AppPageMeta title="Results List" />
        <PageTitle>Answer Scripts List</PageTitle>
        <AppsContainer title={''} fullView={true} type="bottom">
          {data && <TanstackTable data={data} columns={columns} />}
        </AppsContainer>
      </div>

      <Modal open={showAnswerSheetModal} onCancel={() => setShowAnswerSheetModal(false)}>
        <object data={dummyPdf} type="application/pdf" width="500px" height="100%">
          <p>
            Unable to display PDF file. <a href={dummyPdf}>Download</a> instead.
          </p>
        </object>
      </Modal>
    </>
  );
}
