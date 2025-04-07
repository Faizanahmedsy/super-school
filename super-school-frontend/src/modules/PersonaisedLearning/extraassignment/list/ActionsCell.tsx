// import React from 'react';
// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeleteExtraAssignment } from '@/services/management/extraassignment/extraassignment.hook';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const ActionsCell = ({ info }: { info: any }) => {
//   const deleteExtraAssignmentMutation = useDeleteExtraAssignment();
//   const navigate = useNavigate();
//   const extraassignmentId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/extraassignments/${extraassignmentId}/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/extraassignment/update/${extraassignmentId}`);
//   };

//   const handleDelete = () => {
//     deleteExtraAssignmentMutation.mutate(extraassignmentId, {
//       onSuccess: () => {
//         displaySuccess(`ExtraAssignment with ID ${extraassignmentId} deleted successfully.`);
//       }
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

// export default ActionsCell;
