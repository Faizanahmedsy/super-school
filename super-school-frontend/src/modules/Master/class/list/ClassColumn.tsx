import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';

import { ColumnDef } from '@tanstack/react-table';

export const classColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    header: 'Actions',
    cell: (info: any) => <ActionsCell info={info} />,
  },
];

const ActionsCell = ({ info }: { info: any }) => {
  // const [deleteId, setDeleteId] = useState<number | undefined>();
  // const queryclient = useQueryClient();
  // const deleteExamMutaion = useAdminDeleteById(deleteId!, queryclient);

  const moduleName = 'admin';

  const handleEdit = () => {
    const id = info.row.original.id;
    // navigate(`/admin/update/${id}`);
  };

  const handleDelete = () => {
    // const id = info.row.original.id;
    // setDeleteId(id);
    // deleteExamMutaion.mutate();
  };

  return (
    <div className="flex gap-2">
      <TableEditBtn onClick={handleEdit} moduleName={moduleName} />
      <TableDeleteBtn
        onClick={handleDelete}
        moduleName={moduleName}
        // api={deleteExamMutaion}
      />
    </div>
  );
};

// const ProfileImage = ({ info }: { info: any }) => {
//     const [imageError, setImageError] = useState(false);
//     const imageUrl = info.getValue() as string;
//     return (
//         <>
//             {!imageError ? (
//                 <img
//                     src={imageUrl}
//                     alt="Profile"
//                     width={50}
//                     onError={() => setImageError(true)}
//                 />
//             ) : (
//                 <Avatar
//                     size={64}
//                     icon={
//                         <UserOutlined
//                             onPointerEnterCapture={() => { }}
//                             onPointerLeaveCapture={() => { }}
//                         />
//                     }
//                 />
//             )}
//         </>
//     );
// };

export default classColumns;
