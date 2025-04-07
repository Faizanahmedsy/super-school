import { ColumnDef, Row } from '@tanstack/react-table';
import { Form, Input, Modal } from 'antd';
import React, { useState } from 'react';
import TanstackTable from './CustomTable';
import TableDeleteBtn from '../custom/Table/TableDeleteBtn';
import TableEditBtn from '../custom/Table/TableEditBtn';

interface ExampleData {
  key: string;
  name: string;
  rollno: string;
  phone: string;
  gender: string;
  address: string;
  division: string;
  exam: string;
  institute: string;
  course: string;
}

export const ExampleUsage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const data = React.useMemo(
    () => [
      {
        key: '1',
        name: 'John Brown',
        rollno: '25',
        phone: '7878782364',
        gender: 'male',
        address: 'New York No. 1 Lake Park',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '2',
        name: 'Jane Smith',
        rollno: '32',
        phone: '9898982364',
        gender: 'female',
        address: 'California No. 2 River Street',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '3',
        name: 'Alice Johnson',
        rollno: '15',
        phone: '9191912364',
        gender: 'female',
        address: 'Florida No. 3 Hill Lane',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '4',
        name: 'Bob Brown',
        rollno: '18',
        phone: '8080802364',
        gender: 'male',
        address: 'Texas No. 4 Ocean Road',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '5',
        name: 'Charlie Green',
        rollno: '21',
        phone: '7878781234',
        gender: 'male',
        address: 'New Jersey No. 5 River Side',
        division: 'Div-A',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '6',
        name: 'David Wilson',
        rollno: '45',
        phone: '7070702364',
        gender: 'male',
        address: 'Boston No. 6 Bay Road',
        division: 'Div-B',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '7',
        name: 'Eve White',
        rollno: '33',
        phone: '6161612364',
        gender: 'female',
        address: 'Chicago No. 7 Main Street',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '8',
        name: 'Frank Black',
        rollno: '50',
        phone: '5252522364',
        gender: 'male',
        address: 'Los Angeles No. 8 Valley Road',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '9',
        name: 'Grace Lee',
        rollno: '27',
        phone: '8181812364',
        gender: 'female',
        address: 'Las Vegas No. 9 Desert Lane',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '10',
        name: 'Henry Miller',
        rollno: '38',
        phone: '7171712364',
        gender: 'male',
        address: 'Miami No. 10 Ocean Drive',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '11',
        name: 'Isabella Davis',
        rollno: '23',
        phone: '9090902364',
        gender: 'female',
        address: 'Denver No. 11 Mountain View',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '12',
        name: 'Jack Moore',
        rollno: '47',
        phone: '6262622364',
        gender: 'male',
        address: 'Seattle No. 12 Rainy Street',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '13',
        name: 'Katherine Thomas',
        rollno: '19',
        phone: '5555552364',
        gender: 'female',
        address: 'Orlando No. 13 Pine Street',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '14',
        name: 'Liam Taylor',
        rollno: '34',
        phone: '4444442364',
        gender: 'male',
        address: 'Phoenix No. 14 Palm Drive',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '15',
        name: 'Mia Harris',
        rollno: '29',
        phone: '3333332364',
        gender: 'female',
        address: 'Austin No. 15 Sky Road',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '16',
        name: 'Noah Martinez',
        rollno: '14',
        phone: '2222222364',
        gender: 'male',
        address: 'Dallas No. 16 Oak Street',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '17',
        name: 'Olivia Robinson',
        rollno: '40',
        phone: '1111112364',
        gender: 'female',
        address: 'Philadelphia No. 17 Cherry Lane',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '18',
        name: 'Paul Walker',
        rollno: '16',
        phone: '1212122364',
        gender: 'male',
        address: 'Houston No. 18 Hilltop Road',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '19',
        name: 'Quincy Allen',
        rollno: '13',
        phone: '1313132364',
        gender: 'male',
        address: 'Atlanta No. 19 Forest Drive',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '20',
        name: 'Rachel Young',
        rollno: '20',
        phone: '1414142364',
        gender: 'female',
        address: 'San Francisco No. 20 Bayview Lane',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '21',
        name: 'Samuel King',
        rollno: '42',
        phone: '1515152364',
        gender: 'male',
        address: 'Portland No. 21 Sunset Street',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '22',
        name: 'Tina Scott',
        rollno: '26',
        phone: '1616162364',
        gender: 'female',
        address: 'Salt Lake City No. 22 Temple Road',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '23',
        name: 'Uma Lewis',
        rollno: '17',
        phone: '1717172364',
        gender: 'female',
        address: 'Detroit No. 23 Motor Street',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '24',
        name: 'Victor Hill',
        rollno: '28',
        phone: '1818182364',
        gender: 'male',
        address: 'Nashville No. 24 Music Row',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '25',
        name: 'Wendy Adams',
        rollno: '39',
        phone: '1919192364',
        gender: 'female',
        address: 'Cleveland No. 25 Rockside Drive',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '26',
        name: 'Xander Lopez',
        rollno: '11',
        phone: '2020202364',
        gender: 'male',
        address: 'Columbus No. 26 Buckeye Lane',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '27',
        name: 'Yara Turner',
        rollno: '12',
        phone: '2121212364',
        gender: 'female',
        address: 'Indianapolis No. 27 Speedway Road',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
      {
        key: '28',
        name: 'Zach Carter',
        rollno: '30',
        phone: '2222222364',
        gender: 'male',
        address: 'Kansas City No. 28 Plaza Drive',
        division: 'Div-C',
        exam: 'Exam3',
        institute: 'Super_school',
        course: 'Arts',
      },
      {
        key: '29',
        name: 'Aaron Foster',
        rollno: '22',
        phone: '2323232364',
        gender: 'male',
        address: 'Louisville No. 29 Derby Lane',
        division: 'Div-B',
        exam: 'Exam2',
        institute: 'Super_school',
        course: 'Science',
      },
      {
        key: '30',
        name: 'Bella James',
        rollno: '31',
        phone: '2424242364',
        gender: 'female',
        address: 'Tucson No. 30 Desert Road',
        division: 'Div-A',
        exam: 'Exam1',
        institute: 'Super_school',
        course: 'Commerce',
      },
    ],
    []
  );

  const columns = React.useMemo<ColumnDef<ExampleData>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Roll No',
        accessorKey: 'rollno',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
      },
      {
        header: 'Address',
        accessorKey: 'address',
      },
      {
        header: 'Division',
        accessorKey: 'division',
      },
      {
        header: 'Assessment',
        accessorKey: 'exam',
      },
      {
        header: 'School',
        accessorKey: 'institute',
      },
      {
        header: 'Course',
        accessorKey: 'course',
      },
      {
        header: 'Actions',
        cell: ({ row }: { row: Row<ExampleData> }) => (
          <div className="flex justify-start items-start gap-x-3">
            <TableEditBtn onClick={() => handleEdit(row.original)} />
            <TableDeleteBtn onClick={() => handleDelete(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  const handleEdit = (row: ExampleData) => {
    setIsModalOpen(true);
    form.setFieldsValue(row);
  };

  const handleDelete = (row: ExampleData) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this entry?',
      content: `This action will delete ${row.name}'s data. This cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk() {},
      onCancel() {},
    });
  };
  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.validateFields().then(() => {
      // Implement the logic to update the table data
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <TanstackTable data={data} columns={columns} />

      {/* Edit Modal */}
      <Modal
        title="Edit Row"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Roll No" name="rollno" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Division" name="division" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Assessment" name="exam" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="School" name="institute" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Course" name="course" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
