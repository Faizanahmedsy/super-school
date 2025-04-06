import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// interface Subject {
//   id: string | number;
//   subject_name: string;
//   subject_code: string;
//   is_language: boolean;
//   statid: number;
//   terms: number[]; // Adding terms to the subject to handle term data
// }

interface SubjectStore {
  setUpSubjects: {
    grade: string;
    // subjects: Subject[];
  }[]; // Array of objects, each containing a grade and an array of subjects
  addSubject: (subjects: { grade: string; subjects: any }[]) => void;
  removeSubject: (id: string | number) => void;
  resetSubjects: () => void;
  setSetupSubjects: (subjects: any) => void;
}

const useSubjectStore = create<SubjectStore>()(
  devtools(
    persist(
      (set) => ({
        setUpSubjects: [],

        addSubject: (subjects: { grade: string; subjects: any }[]) =>
          set((state) => ({
            setUpSubjects: [
              ...state.setUpSubjects.filter((item) => !subjects.some((subject) => subject.grade === item.grade)), // Remove any existing entry with the same grade
              ...subjects, // Add new subjects with the grade
            ],
          })),
        setSetupSubjects: (subjects: any) => set({ setUpSubjects: subjects }),

        removeSubject: (id) =>
          set((state: any) => ({
            setUpSubjects: state.setUpSubjects.map((gradeSubjects: any) => ({
              ...gradeSubjects,
              subjects: gradeSubjects.subjects.filter((subject: any) => subject.id !== id),
            })),
          })),

        resetSubjects: () => set({ setUpSubjects: [] }),
      }),
      { name: 'subject_store' } // Key for local storage
    )
  )
);

export default useSubjectStore;
