// import TableViewBtn from '@/components/custom/Table/TableViewBtn';
// import TableDeleteBtn from '@/components/global/deleteBtnTable';
// import TableEditBtn from '@/components/global/tableEditBtn';
// import { useDeletePracticleAssesment } from '@/services/management/practicleassesment/practicleassesment.hook';
// import { ColumnDef } from '@tanstack/react-table';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import { PracticleAssesmentData } from './types';

// export const practicleassesmentColumns: ColumnDef<PracticleAssesmentData>[] = [
//   {
//     header: 'Sr No',
//     cell: (info) => info.row.index + 1,
//   },
//   {
//     accessorKey: 'practicleassesment_name',
//     header: 'PracticleAssesment Name',
//     cell: (info) => info.getValue(),
//   },
//   // Add more columns as needed
//   {
//     header: 'Actions',
//     cell: (info) => <ActionsCell info={info} />,
//   },
// ];

// const ActionsCell = ({ info }: { info: any }) => {
//   const deletePracticleAssesmentMutation = useDeletePracticleAssesment();
//   const navigate = useNavigate();

//   const practicleassesmentId = info.row.original.id;

//   const handleView = () => {
//     navigate(`/practicleassesments/$practicleassesmentId/view`);
//   };

//   const handleEdit = () => {
//     navigate(`/practicleassesment/update/$practicleassesmentId`);
//   };

//   const handleDelete = () => {
//     deletePracticleAssesmentMutation.mutate(practicleassesmentId, {
//       onSuccess: () => {
//         displaySuccess(`PracticleAssesment with ID $practicleassesmentId deleted successfully.`);
//       },
//     });
//   };

//   return (
//     <div className='flex gap-2'>
//       <TableViewBtn onClick={handleView} moduleName='PracticleAssesment' />
//       <TableEditBtn onClick={handleEdit} moduleName='PracticleAssesment' />
//       <TableDeleteBtn onClick={handleDelete} moduleName='PracticleAssesment' api={deletePracticleAssesmentMutation} />
//     </div>
//   );
// };
