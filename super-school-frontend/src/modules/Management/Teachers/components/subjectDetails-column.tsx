import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import { useDeleteDivisonSubject } from '@/modules/Master/subject/subject.action';
import { TeacherResponse } from '@/services/types/payload';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Modal } from 'antd';
import { useState } from 'react';

export const SubjectDetailsColumns: ColumnDef<TeacherResponse>[] = [
  {
    accessorKey: 'grade_id',
    header: 'Grade',
    cell: (info: any) => {
      return <p>{info?.row.original?.grade_number}</p>;
    },
  },
  {
    accessorKey: 'grade_class_id',
    header: 'Class',
    cell: (info: any) => <p>{info?.row?.original?.division}</p>,
  },
  {
    accessorKey: 'subject_id',
    header: 'Subject',
    cell: (info: any) => <p>{info?.row?.original?.subject_name}</p>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: (info) => <ActionsCell info={info} />,
  },
];

const ActionsCell = ({ info }: { info: any }) => {
  const [deleteopen, setDeleteOpen] = useState(false);

  const queryclient = useQueryClient();
  const deleteSubjectMutation = useDeleteDivisonSubject();

  const handleDeleteOk = () => {
    deleteSubjectMutation.mutate(info.row.original.id, {
      onSuccess: () => {
        queryclient.invalidateQueries({ queryKey: ['teacher-subject-list-get-byid'] });
        // setDeleteModal(false);
      },
      onError: (error) => {
        console.error('Error deleting subject:', error);
      },
    });
    setDeleteOpen(false);
  };

  const handleDeleteModelClose = () => {
    setDeleteOpen(false);
  };

  return (
    <div className="flex gap-2">
      {/* <TableViewBtn onClick={handleView} /> */}

      <TableDeleteBtn
        // api={deleteSubjectMutation}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          return Modal.confirm({
            title: 'Delete Subject Detail',
            centered: true,
            content: 'Are you sure you want to delete this subject?',
            onOk: handleDeleteOk,
            okButtonProps: { loading: deleteSubjectMutation.isPending },
            onCancel: handleDeleteModelClose,
            cancelText: 'No',
            okText: 'Yes',
          });
        }}
      />
    </div>
  );
};
