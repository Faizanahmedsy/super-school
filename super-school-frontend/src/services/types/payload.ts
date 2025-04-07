export interface LoginPayload {
  email: string;
  password: string;
}
export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  new_password: string;
  token: string;
}

export interface ChangePasswordPayload {
  current_Password: string;
  new_password: string;
}

export interface AddExamPayload {
  exam_name: string;
  total_students: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: string;
  batch_id: number;
}

export interface EditExamPayload {
  exam_name: string;
  total_students: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: string;
  batch_id: number;
}

export interface SettingsPayload {
  themePrimaryColor: string;
  themeSecondaryColor: string;
  support_email: string;
  logo?: string;
}

export interface AddAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  gender: string;
  date_of_birth: string;
  profile_image?: string;
  school_id?: number;
}

export interface EditAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  gender: string;
  address: string;
  profile_image: string;
  school_id: number;
  date_of_birth: string;
}

export interface TeacherPayload {
  first_name: string;
  last_name: string;
  subject_specialization: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  gender: string;
  hire_date: string;
  profile_image: string;
  institute_id: number;
  sace_number?: string;
  persal_number?: string;
  extra_activity: string;
  division_ids: number[];
}

export interface TeacherResponse {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_number: string;
  masterSubjectIds: any;
  subject_specialization: string;
  date_of_birth: string;
  gender: string;
  hire_date: string;
  address: string;
  profile_image: string;
  institute: {
    school_name: string;
    id: number;
  };
  division_ids: number[];
  divisions: {
    name: string;
    id: number;
  };
}

export interface SubjectPaylaod {
  master_subject: {
    subject_name: string;
    subject_code: string;
  };
  grade: {
    grade_number: number;
  };
  division: {
    name: string;
  };
  terms: string[];
}
export interface ParentPayload {
  name: string;
  email: string;
  mobile_number: string;
  gender: string;
  profile_image: string;
  institute_id: number;
}

export interface DoePayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  profile_image: string;
  province_id: number;
  district_id: number;
}

export interface StudentPayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  gender: string;
  school_id: number;
  batch_id: number;
  grade_id: number;
  grade_class_id: number;

  profile_image: string;
  institute_id: number;
  parents_id: number;
  division_id: number;

  parents: [
    {
      first_name: string;
      last_name: string;
      email: string;
      mobile_number: string;
      relationship: string;
    },
  ];
}

export interface AdminResponse {
  name: string;
  email: string;
  mobile_number: string;
  gender: string;
  address: string;
  profile_image: string;
  institute: {
    id: number;
    school_name: string;
    EMIS_number: string;
  };
}

export interface StudentResponse {
  parents: {
    first_name: string;
    last_name: string;
  }[];
  grade: {
    grade_number: string;
  };
  id: number;
  name: string;
  email: string;
  password: string;
  mobile_number: string;
  gender: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  institute_id: number;
  user_id: number;
  student_user_id: number;
  role_id: number;
  address: string;
  created_at: string;
  updated_at: string;
  parents_id: number;
  batch_id: number;
  division_id: number;
  institute: {
    id: number;
    institute_name: string;
    school_name: string;
  };
  division: {
    id: number;
    name: string;
  };
  batch: {
    id: number;
    batchName: string;
    start_year: number;
  };
}

export interface ParentResponse {
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  password: string;
  mobile_number: string;
  gender: string;
  address: string;
  profile_image: string;
  institute: {
    institute_name: string;
    id: number;
  };
}

export interface ChildrenResponse {
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  password: string;
  mobile_number: string;
  gender: string;
  address: string;
  profile_image: string;
}

export interface DoeResponseTable {
  first_name: string;
  last_name: string;

  email: string;

  mobile_number: string;
  job_title: string;

  state: {
    province_name: string;
  };
  city: {
    district_name: string;
  };

  profile_image: string;
}

export interface BatchPayload {
  start_year: number;
}
