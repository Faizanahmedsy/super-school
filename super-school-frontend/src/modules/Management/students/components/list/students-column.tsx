import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { MODULE } from '@/lib/helpers/authHelpers';
import { useStudentDeleteById } from '@/services/management/students/students.hook';

import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentActionsCell = ({ info }: { info: any }) => {
  // const [deleteId, setDeleteId] = useState<number | undefined>();
  // const queryclient = useQueryClient();
  // const { mutate: deleteParent, isPending } = useStudentDeleteById(deleteId!, queryclient);
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = info.row.original.id;
    navigate(`/learner/update/${id}`);
  };

  // const handleDeleteOk = () => {
  //   const id = info.row.original.id;
  //   setDeleteId(id);
  //   deleteParent();
  // };

  return (
    <div className="flex gap-2">
      <TableEditBtn onClick={handleEdit} moduleName={MODULE.STUDENTS} checkPermission={true} />

      {/* <TableDeleteBtn
        checkPermission={true}
        moduleName={MODULE.TEACHERS}
        onClick={(e) => {
          e.stopPropagation();
          return Modal.confirm({
            title: 'Delete Learner',
            centered: true,
            content: 'Are you sure you want to delete this learner?',
            onOk: handleDeleteOk,
            okButtonProps: { loading: isPending },
            onCancel: Modal.destroyAll,
            cancelText: 'No',
            okText: 'Yes',
          });
        }}
      /> */}
    </div>
  );
};
export default StudentActionsCell;
