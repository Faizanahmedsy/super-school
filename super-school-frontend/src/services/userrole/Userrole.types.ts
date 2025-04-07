import { useUpdateAdminNew } from '@/services/master/admin/admin.hook';
import { useCreateUserrole, useUpdateUserrole } from './userrole.actions';

export interface CreateEditUserroleProps {
  editMode?: boolean;
}

type UserroleData = {
  id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
};

export type UserroleApiResponse = {
  currentPage: number;
  list: UserroleData[];
  totalCount: number;
  totalPages: number;
};

export interface UserrolePayload {
  userrole_name: string;
  address: string;
  city_id: number;
  state_id: number;
  registration_number: string;
}

export type MutationApi =
  | ReturnType<typeof useCreateUserrole>
  | ReturnType<typeof useUpdateUserrole>
  | ReturnType<typeof useUpdateAdminNew>;
