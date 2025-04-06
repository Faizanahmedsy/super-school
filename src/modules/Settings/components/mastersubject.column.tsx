import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { useNavigate } from 'react-router-dom';

export const masterSubjectColumn: any = [
  {
    accessorKey: 'grade_number',
    header: 'Grade Number',
  },
  {
    accessorKey: 'subject_name',
    header: 'Subject Name',
  },
  {
    accessorKey: 'subject_code',
    header: 'Subject Code',
  },
  {
    accessorKey: 'is_language',
    header: 'Is Language',
    cell: (row: any) => (row.getValue() ? 'Yes' : 'No'),
  },

  {
    header: 'Actions',
    cell: (info: any) => <ActionsCell info={info} />,
  },
];

const ActionsCell = ({ info }: { info: any }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    const id = info.row.original.id;
    navigate(`/master-subject/update/${id}`, { state: { key: 'edit' } });
  };

  return (
    <div className="flex gap-2">
      <div className="flex gap-2">
        <TableEditBtn onClick={handleEdit} />
      </div>
    </div>
  );
};
