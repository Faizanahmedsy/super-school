import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';

import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Card, Form, Modal, Select } from 'antd';
import { ChevronsUp } from 'lucide-react';
import { useState } from 'react';

export default function UpgradeTeacher() {
  const [openModel, setOpenModel] = useState(false);

  const data = [
    {
      teacher: 'John Doe',
      subjects: ['Math', 'Physics'],
      grades: ['Class 9', 'Class 10'],
      divisions: ['A', 'B'],
    },
    {
      teacher: 'Jane Smith',
      subjects: ['Chemistry', 'Biology'],
      grades: ['Class 11', 'Class 12'],
      divisions: ['B', 'C'],
    },
    {
      teacher: 'Michael Brown',
      subjects: ['English', 'History'],
      grades: ['Class 8', 'Class 10'],
      divisions: ['A', 'C'],
    },
    {
      teacher: 'Emily Johnson',
      subjects: ['Geography', 'Social Studies'],
      grades: ['Class 7', 'Class 9'],
      divisions: ['A', 'B', 'C'],
    },
    {
      teacher: 'Sophia Williams',
      subjects: ['Computer Science', 'Math'],
      grades: ['Class 10', 'Class 12'],
      divisions: ['B'],
    },
    {
      teacher: 'Chris Evans',
      subjects: ['Physics', 'Chemistry'],
      grades: ['Class 9'],
      divisions: ['A', 'B'],
    },
    {
      teacher: 'Anna Garcia',
      subjects: ['Biology', 'Environmental Science'],
      grades: ['Class 11'],
      divisions: ['A'],
    },
    {
      teacher: 'Mark Taylor',
      subjects: ['Physical Education', 'Health'],
      grades: ['Class 7', 'Class 8'],
      divisions: ['A', 'B', 'C'],
    },
  ];

  const columns = [
    {
      accessorKey: 'teacher',
      header: 'Teacher Name',
      cell: ({ row }: any) => <span>{row.original.teacher}</span>,
    },
    {
      accessorKey: 'subjects',
      header: 'Subjects',
      cell: ({ row }: any) => <span>{row.original.subjects.join(', ')}</span>,
    },
    {
      accessorKey: 'grades',
      header: 'Grades',
      cell: ({ row }: any) => <span>{row.original.grades.join(', ')}</span>,
    },
    {
      accessorKey: 'divisions',
      header: 'Divisions',
      cell: ({ row }: any) => <span>{row.original.divisions.join(', ')}</span>,
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

  const [formItems, setFormItems] = useState([{ id: 1 }]);

  const handleAddItem = () => {
    setFormItems([...formItems, { id: formItems.length + 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setFormItems(formItems.filter((item) => item.id !== id));
  };

  return (
    <>
      <div>
        <AppPageMeta title="Teacher List" />
        <PageTitle>Upgrade Teacher</PageTitle>
        <AppsContainer title={''} fullView={true} type="bottom">
          {data && <TanstackTable data={data} columns={columns} />}
        </AppsContainer>
      </div>

      <Modal open={openModel} onCancel={() => setOpenModel(false)} title="Upgrade Teacher" centered width={1000}>
        <ScrollArea className={`pr-4 ${formItems.length > 3 ? 'h-[60vh]' : ''}`}>
          <div className="space-y-5">
            {formItems.map((item) => (
              <Form key={item.id} layout="vertical">
                <Card>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item label={`Select New Grade`}>
                      <Select className="w-full" placeholder="Select grade">
                        <Select.Option value="Class 7">Grade 7</Select.Option>
                        <Select.Option value="Class 8">Grade 8</Select.Option>
                        <Select.Option value="Class 9">Grade 9</Select.Option>
                        <Select.Option value="Class 10">Grade 10</Select.Option>
                        <Select.Option value="Class 10">Grade 11</Select.Option>
                      </Select>
                    </Form.Item>
                    {/* <Form.Item label={`Select New Grade ${index + 1}`}>
                      <Select className="w-full" placeholder="Select grade">
                        <Select.Option value="Class 7">Grade 7</Select.Option>
                        <Select.Option value="Class 8">Grade 8</Select.Option>
                        <Select.Option value="Class 9">Grade 9</Select.Option>
                        <Select.Option value="Class 10">Grade 10</Select.Option>
                        <Select.Option value="Class 10">Grade 11</Select.Option>
                      </Select>
                    </Form.Item> */}
                    <Form.Item label="Select New Class">
                      <Select className="w-full" placeholder="Select classes">
                        <Select.Option value="11A">11A</Select.Option>
                        <Select.Option value="11B">11B</Select.Option>
                        <Select.Option value="11C">11C</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Select Normal Subjects">
                      <Select className="w-full" mode="multiple">
                        <Select.Option value="Physics">Physics (001) (Term 1, Term 2)</Select.Option>
                        <Select.Option value="Chemistry">Chemistry (002) (Term 2, Term 3)</Select.Option>
                        <Select.Option value="Maths">Maths (003) (Term 1)</Select.Option>
                        <Select.Option value="Biology">Biology (004) (Term 1, Term 2, Term 3, Term 4)</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Select Language Subjects">
                      <Select className="w-full" mode="multiple">
                        <Select.Option value="English">English (005) (Term 1, Term 2, Term 3, Term 4)</Select.Option>
                        <Select.Option value="Izulu">Izulu (006) (Term 1, Term 2, Term 3)</Select.Option>
                        <Select.Option value="Izulu">Izulu (007) (Term 1, Term 2)</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                </Card>
                <div className="flex justify-end space-x-2">
                  <Button
                    className="my-4"
                    variant={'outline'}
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={formItems.length === 1} // Prevent removing the last item
                  >
                    <div className="flex gap-4">
                      <MinusCircleOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                      Remove
                    </div>
                  </Button>
                </div>
              </Form>
            ))}
            <div className="flex justify-center mt-4">
              <Button variant={'outline'} onClick={handleAddItem}>
                <div className="flex gap-4">
                  <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                  Add Item
                </div>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </Modal>
    </>
  );
}
