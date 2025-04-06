import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { MODULE } from '@/lib/helpers/authHelpers';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InstituteData } from './types';
import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import useGlobalState from '@/store';

export const instituteColumns: ColumnDef<InstituteData>[] = [
  {
    accessorKey: 'school_name',
    header: 'School Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'state',
    header: 'Province',
    cell: (info) => (info.getValue() as { province_name: string }).province_name,
  },
  {
    accessorKey: 'city',
    header: 'District',
    cell: (info) => (info.getValue() as { district_name: string }).district_name,
  },
  {
    accessorKey: 'EMIS_number',
    header: 'EMIS Number',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'current_users',
    header: 'Current Users',
    cell: (info: any) => (
      <>
        <RenderNullableValue value={info.row.original.current_users} />
      </>
    ),
  },
  {
    accessorKey: 'max_users',
    header: 'Max Users',
    cell: (info: any) => (
      <>
        <RenderNullableValue value={info.row.original.max_users} />
      </>
    ),
  },
  {
    accessorKey: 'admin_count',
    header: 'No. of Admins',
  },
  {
    accessorKey: 'EMIS_number',
    header: 'School Setup',
    cell: (info: any) => {
      return (
        <div className="text-center w-[110px]">
          <div
            className={`${info?.row?.original?.setup === true ? 'bg-nsc-green-light text-white text-center w-full' : 'bg-nsc-red-light text-white'}  rounded-full px-2 py-1 text-center `}
          >
            {info?.row?.original?.setup === true ? 'Completed' : 'Pending'}
          </div>
        </div>
      );
    },
  },

  // {
  //   accessorKey: "created_at",
  //   header: "Created At",
  //   cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
  // },
  {
    header: 'Actions',
    cell: (info) => <ActionsCell info={info} />,
  },
];

const ActionsCell = ({ info }: { info: any }) => {
  // const deleteInstituteMutation = useDeleteInstitute();
  const navigate = useNavigate();
  const setStep = useGlobalState((state) => state.setInstituteStep);

  const instituteId = info.row.original.id;

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setStep(1);
    navigate(`/school/update/${instituteId}`);
  };

  // const handleDelete = () => {
  //   deleteInstituteMutation.mutate(instituteId, {
  //     onSuccess: () => {
  //       displaySuccess(
  //         `Institute with ID ${instituteId} deleted successfully.`
  //       );
  //     },
  //   });
  // };

  return (
    <div className="flex gap-2">
      {/* <TableViewBtn onClick={handleView} moduleName={moduleName} /> */}
      <TableEditBtn onClick={handleEdit} moduleName={MODULE.INSTITUTE} checkPermission={true} />
      {/* <TableDeleteBtn
        onClick={handleDelete}
        moduleName={moduleName}
        api={deleteInstituteMutation}
      /> */}
    </div>
  );
};
