import { useCreateSettings, useUpdateSettings } from '../actions/settings.actions';

export interface CreateEditSettingsProps {
  editMode?: boolean;
}

type SettingsData = {
  id: number;
  settings_name: string;
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

export type SettingsApiResponse = {
  currentPage: number;
  list: SettingsData[];
  totalCount: number;
  totalPages: number;
};

export interface SettingsPayload {
  settings_name: string;
  address: string;
  city_id: number;
  state_id: number;
  registration_number: string;
}

export type MutationApi = ReturnType<typeof useCreateSettings> | ReturnType<typeof useUpdateSettings>;
