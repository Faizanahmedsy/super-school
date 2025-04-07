import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { MODULE } from '@/lib/helpers/authHelpers';
import { useAdminDeleteById } from '@/services/master/admin/admin.hook';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminActionsCell = ({ info }: { info: any }) => {
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const queryclient = useQueryClient();
  const { mutate: deleteAdmin, isPending } = useAdminDeleteById(deleteId!, queryclient);
  const navigate = useNavigate();

  const handleEdit = () => {
    const id = info.row.original.id;
    navigate(`/admin/update/${id}`);
  };

  const handleDeleteOk = () => {
    const id = info.row.original.id;
    setDeleteId(id);
    deleteAdmin();
  };

  return (
    <div className="flex gap-2">
      <TableEditBtn onClick={handleEdit} moduleName={MODULE.ADMIN} checkPermission={true} />
      <TableDeleteBtn
        moduleName={MODULE.ADMIN}
        checkPermission={true}
        onClick={(e) => {
          e.stopPropagation();
          return Modal.confirm({
            title: 'Delete Admin',
            centered: true,
            content: 'Are you sure you want to delete this admin?',
            onOk: handleDeleteOk,
            okButtonProps: { loading: isPending },
          });
        }}
      />
    </div>
  );
};

export default AdminActionsCell;
