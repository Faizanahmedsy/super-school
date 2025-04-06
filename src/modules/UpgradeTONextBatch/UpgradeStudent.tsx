import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { Form, Modal, Select } from 'antd';
import { ChevronsUp } from 'lucide-react';
import { useState } from 'react';

export default function UpgradeStudent() {
  const [openModel, setOpenModel] = useState(false);

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
      header: 'Class',
      cell: ({ row }: any) => <span>{row.original.grade}</span>,
    },
    {
      accessorKey: 'standard',
      header: 'Grade',
      cell: ({ row }: any) => <span>{row.original.standard}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button variant={'outline'} onClick={() => setOpenModel(true)}>
            <ChevronsUp />
            Upgrade
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <AppPageMeta title="Results List" />
        <PageTitle>Upgrade Learner</PageTitle>
        <AppsContainer title={''} fullView={true} type="bottom">
          {data && <TanstackTable data={data} columns={columns} />}
        </AppsContainer>
      </div>

      <Modal open={openModel} onCancel={() => setOpenModel(false)} title="Upgrade" centered>
        <div className="space-y-5">
          <div>This Learner is Currently in 10th Grade and Will be Upgraded to 11 Grade</div>
          <Form layout="vertical">
            <Form.Item label="Select New Class">
              <Select className="w-full">
                <Select.Option value="11A">11A</Select.Option>
                <Select.Option value="11B">11B</Select.Option>
                <Select.Option value="11C">11C</Select.Option>
              </Select>
            </Form.Item>

            {/* Select New Subjects */}
            <Form.Item label="Select Normal Subjects">
              <Select className="w-full" mode="multiple">
                <Select.Option value="Physics">Physics</Select.Option>
                <Select.Option value="Chemistry">Chemistry</Select.Option>
                <Select.Option value="Maths">Maths</Select.Option>
                <Select.Option value="Biology">Biology</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Select Language Subjects">
              <Select className="w-full" mode="multiple">
                <Select.Option value="English">English</Select.Option>
                <Select.Option value="Izulu">Izulu</Select.Option>
                <Select.Option value="Izulu">Izulu</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}
