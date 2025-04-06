import { QueryParams } from '@/services/types/params';
import { useCreatePermission, useUpdatePermission } from './permission.actions';

export interface CreateEditPermissionProps {
  editMode?: boolean;
}

export interface PermissionListQuery extends QueryParams {
  institute_id?: number;
  role_id?: number;
}

type PermissionData = {
  allow: any;
  module: any;
  id: number;
  permission_name: string;
  address: string;
  city: {
    id: number;
    city_name: string;
  };
  city_id: number;
  state: {
    id: number;
    state_name: string;
  };
  state_id: number;
  registration_number: string;
  created_at: string;
  updated_at: string;
};

export type PermissionApiResponse = {
  currentPage: number;
  list: PermissionData[];
  totalCount: number;
  totalPages: number;
};

export interface PermissionPayload {
  permission_name: string;
  address: string;
  city_id: number;
  state_id: number;
  registration_number: string;
}

export type MutationApi = ReturnType<typeof useCreatePermission> | ReturnType<typeof useUpdatePermission>;
