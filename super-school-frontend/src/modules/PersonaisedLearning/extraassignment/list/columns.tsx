// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeleteExtraAssignment } from '@/services/management/extraassignment/extraassignment.hook';
// import { ColumnDef } from '@tanstack/react-table';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import { ExtraAssignmentData } from './types';

// export const extraassignmentColumns: ColumnDef<ExtraAssignmentData>[] = [
//   {
//     header: 'Sr No',
//     cell: (info) => info.row.index + 1,
//   },
//   {
//     accessorKey: 'extraassignment_name',
//     header: 'ExtraAssignment Name',
//     cell: (info) => info.getValue(),
//   },
//   // Add more columns as needed
//   {
//     header: 'Actions',
//     cell: (info) => <ActionsCell info={info} />,
//   },
// ];

// const ActionsCell = ({ info }: { info: any }) => {
//   const deleteExtraAssignmentMutation = useDeleteExtraAssignment();
//   const navigate = useNavigate();

//   const extraassignmentId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/extraassignments/$extraassignmentId/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/extraassignment/update/$extraassignmentId`);
//   };

//   const handleDelete = () => {
//     deleteExtraAssignmentMutation.mutate(extraassignmentId, {
//       onSuccess: () => {
//         displaySuccess(`ExtraAssignment with ID $extraassignmentId deleted successfully.`);
//       },
//     });
//   };

//   return (
//     <div className='flex gap-2'>
//       <TableViewBtn onClick={handleView} moduleName='ExtraAssignment' />
//       <TableEditBtn onClick={handleEdit} moduleName='ExtraAssignment' />
//       <TableDeleteBtn onClick={handleDelete} moduleName='ExtraAssignment' api={deleteExtraAssignmentMutation} />
//     </div>
//   );
// };
