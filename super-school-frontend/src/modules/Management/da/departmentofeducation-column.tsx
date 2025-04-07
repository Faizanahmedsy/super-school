import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { useDoeDeleteById } from '@/services/doe/doe.hook';
import { DoeResponseTable } from '@/services/types/payload';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Modal } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODULE } from '@/lib/helpers/authHelpers';

export const departmentofeducationcolumn: ColumnDef<DoeResponseTable>[] = [
  {
    accessorKey: 'profile_image',
    header: '',
    cell: (info) => <ProfileImageAvatar info={info} />,
  },
  {
    accessorKey: 'first_name',
    header: 'Name',
  },
  {
    accessorKey: 'last_name',
    header: 'Surname',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'mobile_number',
    header: 'Mobile Number',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'job_title',
    header: 'Job Title',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'province_name',
    header: 'Province',
    cell: (state: any) => {
      const provincename = state?.row?.original?.state?.province_name;

      return <p>{provincename || 'N/A'}</p>;
    },
  },
  {
    accessorKey: 'district',
    header: 'District',
    cell: (state: any) => {
      const city = state?.row?.original?.city?.district_name;

      return <p>{city || 'N/A'}</p>;
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: (info) => <ActionsCell info={info} />,
  },
];

const ActionsCell = ({ info }: { info: any }) => {
  const [deleteopen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const queryclient = useQueryClient();
  const { mutate: deleteDoe, isPending } = useDoeDeleteById(deleteId!, queryclient);
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = info.row.original.id;
    navigate(`/department-admin/update/${id}`);
  };

  const handleDeleteOk = () => {
    deleteDoe();
    setDeleteOpen(false);
  };

  const handleDeleteModelClose = () => {
    setDeleteOpen(false);
  };

  return (
    <div className="flex gap-2">
      {/* <TableViewBtn onClick={handleView} /> */}
      <TableEditBtn onClick={handleEdit} checkPermission={true} moduleName={MODULE.DEPARTMENT_OF_EDUCATION} />
      <TableDeleteBtn
        checkPermission={true}
        moduleName={MODULE.DEPARTMENT_OF_EDUCATION}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDeleteId(info.row.original.id);
          return Modal.confirm({
            title: 'Delete Department Admin',
            centered: true,
            content: 'Are you sure you want to delete this department admin?',
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

export default ActionsCell;
