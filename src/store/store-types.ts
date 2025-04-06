import { SchoolType } from '@/types/types';

export interface Permission {
  id: number;
  role_id: number;
  module_id: number;
  institute_id: number;
  allow: {
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
  };
  module: {
    id: number;
    module_name: string;
    module_name_show: string;
  };
}

export interface UserAuthResp {
  // cur_batch: {
  //   id: number;
  //   start_year: number
  // }
  details: {
    id: number;
    school_id: number;
    division: {
      id: number;
    }

    students: [{
      id: number
      cur_batch_id: number
      first_name: string
      last_name: string
    }]
    grade: {
      id: number;
      name: string;
      grade_number: number;
    };
    first_name: string;
    last_name: string;
    profile_image: string;
  };
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_name: string;
  gender: string;
  mobile_number: string;
  address: string;
  institute_id: number;
  status: string;
  role_id: number;
  state_id: number;
  city_id: number;
  profile_image: string;
  permissions: Permission[];
  role_name: string;
  role_name_show: string;
  cur_batch?: {
    id?: number;
    name?: string;
    start_year?: number;
  };
  school?: {
    id?: number;
    name?: string;
    school_type?: 'private' | 'public';
  };
}

export interface AuthState {
  role: string;
  permissions: Permission[];
  accessToken: string;
  role_name: string;
  user: UserAuthResp | null;
  setUser: (userData: UserAuthResp, accessToken: string) => void;
  logout: () => void;
}

export interface GlobalState {
  school_id: string | null | undefined;
  lang_name: string | null | undefined;
  role_id: string | null | undefined;
  module_id: string | null | undefined;
  batch_id: string | null | undefined;
  grade_id: string | null | undefined;
  subject_id: string | null | undefined;
  set_step_id: number | null | undefined;
  setinstitute_step_id: number | null | undefined;
  division_id: number | null | undefined;
  teacher_id: string | null | undefined;
  start_date: string | null | undefined;
  end_date: string | null | undefined;
  setUpWizardSelectedGrades: string[] | null | undefined;
  assessmentDetailsId: number | null | undefined;
  user: UserAuthResp | null | undefined | any;
  notification_count: number | null | undefined;
  setNotificationCount: number | null | undefined;
  setLang: any;
  student_id: string | null | undefined;
  generalSettings: {
    primary_color: string | null | undefined;
    secondory_color: string | null | undefined;
  };
  masterSchool: {
    id: string;
    name: string;
    cur_batch: {
      id: string;
      is_active: boolean;
      start_year: number;
    };
    school_type: SchoolType;
  };
  subjectDetailsId: {
    gradeclass?: {
      id: number;
    };
    subjectdetailsid?: {
      id: number;
    };
  };
  setUpData: any;
  isSetUpWizardCompleted: boolean;
  term_id: string | null | undefined;
  assessment_id: string | null | undefined;
  breadcrumbs_step: number | null | undefined;
  setUpWizardCurrentStep: number | undefined;
  marking_assessment_subject: string | null | undefined;
  marking_grade_class: string | null | undefined;
  filterData: {
    batch?: {
      id: string; //TODO: THIS IDS SHOULD NEVER BE STRING IT SHOULD BE NUMBER NEED TO CHANGE IT
      name: string;
    };
    grade?: {
      id: string;
      name: string;
    };
    subject?: {
      id: string;
      name: string;
      details?: any;
    };
    class?: {
      id: string;
      name: string;
    };
    term?: {
      id: string;
      name: string;
    };
    masterSubject?: {
      id: string;
      name: string;
    };
  };
  assessmentTileFilter: {
    batch?: {
      id: string;
      name: string;
    };
    grade?: {
      id: string;
      name: string;
    };
    subject?: {
      id: string;
      name: string;
    };
    class?: {
      id: string;
      name: string;
    };
    term?: {
      id: string;
      name: string;
    };
    masterSubject?: {
      id: string;
      name: string;
    };
  };
  setSchoolId: (newSchoolId: string | null | undefined) => void;
  setRoleId: (newRoleId: string | null | undefined) => void;
  setModuleId: (newModuleId: string | null | undefined) => void;
  setBatchId: (newBatchId: string | null | undefined) => void;
  setGradeId: (newGradeId: string | null | undefined) => void;
  setSubjectId: (newSubjectId: string | null | undefined) => void;
  setTermId: (newTermId: string | null | undefined) => void;
  setCurrentStep: (newStepId: number | null | undefined) => void;
  setInstituteStep: (newStepId: number | null | undefined) => void;
  setDivisionId: (newDivisionId: number | null | undefined) => void;
  setTeacherId: (newTeacherId: string | null | undefined) => void;
  setStartDate: (newStartDate: string | null | undefined) => void;
  setEndDate: (newEndDate: string | null | undefined) => void;
  setAssessmentId: (newAssessmentId: string | null | undefined) => void;
  setSetUpWizardSelectedGrades: (newGrades: string[] | null | undefined) => void;
  setAssessmentDetailsId: (newAssessmentDetailsId: number | null | undefined) => void;
  setUser: (newUser: UserAuthResp | null | undefined) => void;
  setSetUpData: (newSetUpData: any) => void;
  setSubjectDetailsId: (newSubjectDetailsId: {
    gradeclass?: {
      id: number;
    };
    subjectdetailsid?: {
      id: number;
    };
  }) => void;
  setMasterSchool: (newMasterSchool: any) => void;
  setGeneralSettings: (newGeneralSettings: any) => void;
  setBreadCrumbStep: (newBreadcrumbs: number | null | undefined) => void;
  setIsSetUpWizardCompleted: (isCompleted: boolean) => void;
  setSetUpWizardCurrentStep: (newStep: number | undefined) => void;
  setMarkingAssessmentSubject: (newMarkingAssessmentSubject: string | null | undefined) => void;
  setMarkingGradeClass: (newMarkingGradeClass: string | null | undefined) => void;
  setStudentId: (newStudentId: string | null | undefined) => void;
  resetState: () => void;
  setFilterData: (newFilterData: {
    batch?: {
      id: string;
      name: string;
    };
    grade?: {
      id: string;
      name: string;
    };
    subject?: {
      id: string;
      name: string;
      details?: any;
    };
    term?: {
      id: string;
      name: string;
    };
    class?: {
      id: string;
      name: string;
    };
    masterSubject?: {
      id: string;
      name: string;
    };
  }) => void;
  setAssessmentTileFilter: (newFilterData: {
    batch?: {
      id: string;
      name: string;
    };
    grade?: {
      id: string;
      name: string;
    };
    subject?: {
      id: string;
      name: string;
    };
    term?: {
      id: string;
      name: string;
    };
    class?: {
      id: string;
      name: string;
    };
    masterSubject?: {
      id: string;
      name: string;
    };
  }) => void;
}
