import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Avatar, Space } from 'antd';
import React from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import styles from './CustomTablev2.module.css';

interface Student {
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

const CustomTableV2: React.FC = () => {
  // const { data: productListdata } = useStudentList();
  // const { messages } = useIntl();

  const columnHelper = createColumnHelper<Student>();

  const columns = [
    columnHelper.accessor('key', {
      header: 'Sr.No',
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Space>
          <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
          <span>{info.getValue()}</span>
        </Space>
      ),
    }),
    columnHelper.accessor('rollno', {
      header: 'Roll.No',
    }),
    columnHelper.accessor('phone', {
      header: 'Phone.No',
    }),
    columnHelper.accessor('gender', {
      header: 'Gender',
    }),
    columnHelper.accessor('address', {
      header: 'Address',
    }),
    columnHelper.accessor('division', {
      header: 'Division',
    }),
    columnHelper.accessor('exam', {
      header: 'Assessment',
    }),
    columnHelper.accessor('institute', {
      header: 'Institute',
    }),
    columnHelper.accessor('course', {
      header: 'Course Year',
    }),
    columnHelper.accessor(() => 'action', {
      id: 'action',
      header: 'Action',
      cell: () => (
        <Space size="middle">
          <span className={styles.editIcon}>
            <FaRegEdit size={18} />
          </span>
          <span className={styles.deleteIcon}>
            <RiDeleteBin6Line size={18} />
          </span>
        </Space>
      ),
    }),
  ];

  const data: Student[] = [
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
    // ... (other data entries)
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CustomTableV2;
