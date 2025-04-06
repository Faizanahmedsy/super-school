import { useCreateInstitute, useUpdateInstitute } from '@/services/management/institute/institute.hook';
import { useUpdateAdminNew } from '@/services/master/admin/admin.hook';

export interface CreateEditInstituteProps {
  editMode?: boolean;
}

export type InstituteData = {
  id: number;
  school_name: string;
  address: string;
  cur_batch: {
    id: string;
    is_active: boolean;
    start_year: number;
  };
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

export type InstituteApiResponse = {
  currentPage: number;
  list: InstituteData[];
  totalCount: number;
  totalPages: number;
};

export interface InstitutePayload {
  school_name: string;
  district_id: number;
  province_id: number;
  school_type: string;
  max_users: number;
  medium_of_instruction: string;
  EMIS_number: string;
  address: string;
  location_type: string;
  contact_number: string;
  contact_person: string;
  contact_email: string;
}

export type MutationApi =
  | ReturnType<typeof useCreateInstitute>
  | ReturnType<typeof useUpdateInstitute>
  | ReturnType<typeof useUpdateAdminNew>;
