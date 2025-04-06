// import React from 'react';
// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeleteBatch } from '@/services/management/batch/batch.hook';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const ActionsCell = ({ info }: { info: any }) => {
//   const deleteBatchMutation = useDeleteBatch();
//   const navigate = useNavigate();
//   const batchId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/batchs/${batchId}/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/batch/update/${batchId}`);
//   };

//   const handleDelete = () => {
//     deleteBatchMutation.mutate(batchId, {
//       onSuccess: () => {
//         displaySuccess(`Batch with ID ${batchId} deleted successfully.`);
//       }
//     });
//   };

//   return (
//     <div className='flex gap-2'>
//       <TableViewBtn onClick={handleView} moduleName='Batch' />
//       <TableEditBtn onClick={handleEdit} moduleName='Batch' />
//       <TableDeleteBtn onClick={handleDelete} moduleName='Batch' api={deleteBatchMutation} />
//     </div>
//   );
// };

// export default ActionsCell;
