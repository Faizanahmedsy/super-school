import { create } from 'zustand';

import { devtools, persist } from 'zustand/middleware';

interface SetUpDataType {
  step: 'CREATE_YEAR' | 'CREATE_GRADES' | 'CREATE_CLASSES' | 'ASSIGN_SUBJECTS';
  data:
    | { year: number }
    | { grades: { grade_number: number }[] }
    | {
        grades: {
          grade_number: number;
          number_of_classes: number;
          classes: { class: string }[];
        }[];
      }
    | {
        subjects: {
          master_subject_id: number;
          school_id: number;
          grade_id: number;
          batch_id: number;
        }[];
      };
}

interface SetupWizardGlobalState {
  setupData: SetUpDataType | null;
  setSetupData: (setupData: SetUpDataType) => void;
}

const initialState: Partial<SetupWizardGlobalState> = {
  setupData: null,
};

const createStateUpdaters = (set: (state: Partial<SetupWizardGlobalState>) => void) => ({
  setSetupData: (setupData: SetUpDataType) => set({ setupData }),
});

const useGlobalUserState = create<SetupWizardGlobalState>()(
  devtools(
    persist<SetupWizardGlobalState>(
      (set) => ({
        ...initialState,
        ...createStateUpdaters(set),
        ...(initialState as SetupWizardGlobalState),
      }),
      { name: 'setup_wizard_store' }
    )
  )
);

export default useGlobalUserState;
