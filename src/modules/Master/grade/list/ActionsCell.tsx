// import React from 'react';
// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeleteGrade } from '@/services/management/grade/grade.hook';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const ActionsCell = ({ info }: { info: any }) => {
//   const deleteGradeMutation = useDeleteGrade();
//   const navigate = useNavigate();
//   const gradeId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/grades/${gradeId}/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/grade/update/${gradeId}`);
//   };

//   const handleDelete = () => {
//     deleteGradeMutation.mutate(gradeId, {
//       onSuccess: () => {
//         displaySuccess(`Grade with ID ${gradeId} deleted successfully.`);
//       }
//     });
//   };

//   return (
//     <div className='flex gap-2'>
//       <TableViewBtn onClick={handleView} moduleName='Grade' />
//       <TableEditBtn onClick={handleEdit} moduleName='Grade' />
//       <TableDeleteBtn onClick={handleDelete} moduleName='Grade' api={deleteGradeMutation} />
//     </div>
//   );
// };

// export default ActionsCell;
