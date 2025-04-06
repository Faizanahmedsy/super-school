import { create } from 'zustand';
import { GlobalState } from './store-types';

import { devtools, persist } from 'zustand/middleware';
import secureLocalStorage from 'react-secure-storage';

const encrypt = (value: any): string => {
  return JSON.stringify(value); // Placeholder: Use encryption logic if needed
};

const decrypt = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const secureStorage = {
  getItem: (name: string) => {
    const data = secureLocalStorage.getItem(name);
    return data ? decrypt(data as string) : null;
  },
  setItem: (name: string, value: any) => {
    secureLocalStorage.setItem(name, encrypt(value));
  },
  removeItem: (name: string) => {
    secureLocalStorage.removeItem(name);
  },
};

const initialState: Partial<GlobalState> = {
  school_id: null,
  role_id: null,
  module_id: null,
  batch_id: null,
  grade_id: null,
  subject_id: null,
  student_id: null,
  lang_name: null,
  term_id: null,
  assessmentDetailsId: null,
  assessment_id: null,
  set_step_id: 1,
  setinstitute_step_id: 1,
  teacher_id: null,
  division_id: null,
  start_date: null,
  end_date: null,
  breadcrumbs_step: null,
  subjectDetailsId: {},
  setUpWizardSelectedGrades: [],
  user: null,
  setUpData: {},
  filterData: {},
  assessmentTileFilter: {},
  isSetUpWizardCompleted: false,
  setUpWizardCurrentStep: 1,
  marking_assessment_subject: null,
  marking_grade_class: null,
  notification_count: null,
  masterSchool: {
    id: '',
    name: '',
    school_type: undefined,
    cur_batch: {
      id: '',
      is_active: false,
      start_year: 0,
    },
  },
  generalSettings: {
    primary_color: '',
    secondory_color: '',
  },
};

const createStateUpdaters = (set: (state: Partial<GlobalState>) => void) => ({
  setFilterData: (filterData: any) => set({ filterData }),
  setAssessmentTileFilter: (assessmentTileFilter: any) => set({ assessmentTileFilter }),
  setSchoolId: (school_id: string | null) => set({ school_id }),
  setRoleId: (role_id: string | null) => set({ role_id }),
  setModuleId: (module_id: string | null) => set({ module_id }),
  setBatchId: (batch_id: string | null) => set({ batch_id }),
  setGradeId: (grade_id: string | null) => set({ grade_id }),
  setSubjectId: (subject_id: string | null) => set({ subject_id }),
  setTermId: (term_id: string | null) => set({ term_id }),
  setTeacherId: (teacher_id: string | null) => set({ teacher_id }),
  setAssessmentId: (assessment_id: string | null) => set({ assessment_id }),
  setCurrentStep: (set_step_id: number) => set({ set_step_id }),
  setInstituteStep: (setinstitute_step_id: number) => set({ setinstitute_step_id }),
  setDivisionId: (division_id: number | null) => set({ division_id }),
  setStartDate: (start_date: string | null) => set({ start_date }),
  setEndDate: (end_date: string | null) => set({ end_date }),
  setBreadCrumbStep: (breadcrumbs_step: number | null) => set({ breadcrumbs_step }),
  setSetUpWizardSelectedGrades: (setUpWizardSelectedGrades: string[]) => set({ setUpWizardSelectedGrades }),
  setUser: (user: any) => set({ user }),
  setSetUpData: (setUpData: any) => set({ setUpData }),
  setSubjectDetailsId: (subjectDetailsId: any) => set({ subjectDetailsId }),
  setAssessmentDetailsId: (assessmentDetailsId: number | null) => set({ assessmentDetailsId }),
  setIsSetUpWizardCompleted: (isSetUpWizardCompleted: boolean) => set({ isSetUpWizardCompleted }),
  setSetUpWizardCurrentStep: (setUpWizardCurrentStep: number) => set({ setUpWizardCurrentStep }),
  setMarkingAssessmentSubject: (marking_assessment_subject: any) => set({ marking_assessment_subject }),
  setMarkingGradeClass: (marking_grade_class: any) => set({ marking_grade_class }),
  setGeneralSettings: (generalSettings: any) => set({ generalSettings }),
  setMasterSchool: (masterSchool: any) => set({ masterSchool }),
  setStudentId: (student_id: string | null) => set({ student_id }),
  setNotificationCount: (notification_count: number) => set({ notification_count }),
  setLang: (lang_name: string) => set({ lang_name }),

  resetState: () => set({ ...initialState }),
});

const useGlobalState = create<GlobalState>()(
  devtools(
    persist<GlobalState>(
      (set) => ({
        ...initialState,
        ...createStateUpdaters(set),
        ...(initialState as GlobalState),
      }),
      {
        name: 'global_state',
        // storage: secureStorage, // TODO: USE THIS LATER
      }
    )
  )
);

export default useGlobalState;
