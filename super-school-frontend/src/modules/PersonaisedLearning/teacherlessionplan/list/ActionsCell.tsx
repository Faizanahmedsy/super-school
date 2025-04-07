// import React from 'react';
// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeleteTeacherLessionPlan } from '@/services/management/teacherlessionplan/teacherlessionplan.hook';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const ActionsCell = ({ info }: { info: any }) => {
//   const deleteTeacherLessionPlanMutation = useDeleteTeacherLessionPlan();
//   const navigate = useNavigate();
//   const teacherlessionplanId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/teacherlessionplans/${teacherlessionplanId}/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/teacherlessionplan/update/${teacherlessionplanId}`);
//   };

//   const handleDelete = () => {
//     deleteTeacherLessionPlanMutation.mutate(teacherlessionplanId, {
//       onSuccess: () => {
//         displaySuccess(`TeacherLessionPlan with ID ${teacherlessionplanId} deleted successfully.`);
//       }
//     });
//   };

//   return (
//     <div className='flex gap-2'>
//       <TableViewBtn onClick={handleView} moduleName='TeacherLessionPlan' />
//       <TableEditBtn onClick={handleEdit} moduleName='TeacherLessionPlan' />
//       <TableDeleteBtn onClick={handleDelete} moduleName='TeacherLessionPlan' api={deleteTeacherLessionPlanMutation} />
//     </div>
//   );
// };

// export default ActionsCell;
