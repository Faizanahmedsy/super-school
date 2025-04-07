import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { MODULE } from '@/lib/helpers/authHelpers';
import { useTeacherDeleteById } from '@/services/management/teacher/teacher.hook';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TeacherActionsCell = ({ info }: { info: any }) => {
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const queryclient = useQueryClient();
  const { mutate: deleteTeacher, isPending } = useTeacherDeleteById(deleteId!, queryclient);
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = info.row.original.id;
    navigate(`/teacher/update/${id}`);
  };

  const handleDeleteOk = () => {
    const id = info.row.original.id;
    setDeleteId(id);
    deleteTeacher();
  };

  const handleDeleteModelClose = () => {
    // setDeleteOpen(false);
  };

  return (
    <div className="flex gap-2">
      {/* <TableViewBtn onClick={handleView} /> */}
      <TableEditBtn onClick={handleEdit} moduleName={MODULE.TEACHERS} checkPermission={true} />
      <TableDeleteBtn
        moduleName={MODULE.TEACHERS}
        checkPermission={true}
        onClick={(e) => {
          e.stopPropagation();
          return Modal.confirm({
            title: 'Delete Teacher',
            centered: true,
            content: 'Are you sure you want to delete this teacher?',
            onOk: handleDeleteOk,
            okButtonProps: { loading: isPending },
            onCancel: handleDeleteModelClose,
            cancelText: 'No',
            okText: 'Yes',
          });
        }}
      />
    </div>
  );
};
