'use client';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { MODULE } from '@/lib/helpers/authHelpers';
import { useParentDeleteById } from '@/services/management/parent/parent.hook';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ParentActionsCell = ({ info }: { info: any }) => {
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const queryclient = useQueryClient();
  const { mutate: deleteParent, isPending } = useParentDeleteById(deleteId!, queryclient);
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = info.row.original.id;
    navigate(`/parent/update/${id}`);
  };

  const handleDeleteOk = () => {
    const id = info.row.original.id;
    setDeleteId(id);
    deleteParent();
  };

  return (
    <div className="flex gap-2">
      {/* <TableViewBtn onClick={handleView} /> */}
      <TableEditBtn onClick={handleEdit} moduleName={MODULE.PARENTS} checkPermission={true} />
      <TableDeleteBtn
        moduleName={MODULE.PARENTS}
        checkPermission={true}
        onClick={(e) => {
          e.stopPropagation();
          return Modal.confirm({
            title: 'Delete Parent',
            centered: true,
            content: 'Are you sure you want to delete this parent?',
            onOk: handleDeleteOk,
            okButtonProps: { loading: isPending },
            cancelText: 'No',
            okText: 'Yes',
          });
        }}
      />
    </div>
  );
};

export default ParentActionsCell;
