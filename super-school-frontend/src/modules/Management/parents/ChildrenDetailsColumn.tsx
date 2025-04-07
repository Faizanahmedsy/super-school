import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import { ChildrenResponse } from '@/services/types/payload';
import { ColumnDef } from '@tanstack/react-table';

export const ChildrenColumns: ColumnDef<ChildrenResponse>[] = [
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
];
