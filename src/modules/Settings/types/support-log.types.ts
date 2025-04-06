export interface SupportLogResp {
  data: any[];
}

export interface SupportLogDetailsResp {
  id: string;
  description: string;
  email: string;
  role_name: string;
  attachment: string[];
  user_id: string;
  school_id: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  institute: {
    id: string;
    school_name: string;
    district_id: string;
    province_id: string;
    school_type: string;
    medium_of_instruction: string;
    EMIS_number: string;
    address: string;
    location_type: string;
    contact_number: string;
    contact_person: string;
    contact_email: string;
    themePrimaryColor: string | null;
    themeSecondaryColor: string | null;
    logo: string | null;
    max_users: number;
    current_users: number;
    created_by: string;
    updated_by: string | null;
    deleted_by: string | null;
    setup: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  creator: {
    id: string;
    email: string;
    password: string;
    user_name: string;
    role_id: string;
    school_id: string;
    status: string;
    resetToken: string | null;
    resetTokenExpires: string | null;
    created_by: string;
    updated_by: string;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}
