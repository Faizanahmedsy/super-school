// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeleteClass } from '@/services/management/class/class.hook';
// import { ColumnDef } from '@tanstack/react-table';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import { ClassData } from './types';

// export const classColumns: ColumnDef<ClassData>[] = [
//   {
//     header: 'Sr No',
//     cell: (info) => info.row.index + 1,
//   },
//   {
//     accessorKey: 'class_name',
//     header: 'Class Name',
//     cell: (info) => info.getValue(),
//   },
//   // Add more columns as needed
//   {
//     header: 'Actions',
//     cell: (info) => <ActionsCell info={info} />,
//   },
// ];

// const ActionsCell = ({ info }: { info: any }) => {
//   const deleteClassMutation = useDeleteClass();
//   const navigate = useNavigate();

//   const classId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/classs/$classId/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/class/update/$classId`);
//   };

//   const handleDelete = () => {
//     deleteClassMutation.mutate(classId, {
//       onSuccess: () => {
//         displaySuccess(`Class with ID $classId deleted successfully.`);
//       },
//     });
//   };

//   return (
//     <div className='flex gap-2'>
//       <TableViewBtn onClick={handleView} moduleName='Class' />
//       <TableEditBtn onClick={handleEdit} moduleName='Class' />
//       <TableDeleteBtn onClick={handleDelete} moduleName='Class' api={deleteClassMutation} />
//     </div>
//   );
// };
