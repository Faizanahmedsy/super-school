export interface YearData {
    year: number;
}

export interface GradeData {
    grade_number: number;
    id: number;
}

export interface ClassData {
    class: string;
}

export interface GradeWithClasses {
    grade_number: number;
    number_of_classes: number;
    classes: ClassData[];
}

export interface SubjectAssignmentData {
    subjects: {
        master_subject_id: number;
        school_id: number;
        grade_id: number;
        batch_id: number;
    }[];
}
