import { string } from "joi";
import * as path from "path";

export declare const LANGUAGE_CODE: {
    EN: string;
    AF: string;
    ZU: string;
};

export declare const ROLE: {
    MASTER_ADMIN: string;
    SUB_ADMIN: string;
    TEACHER: string;
    PARENTS: string;
    STUDENT: string;
    GUEST_USER: string;
    DEPARTMENT_OF_EDUCTION: string;
    DEPARTMENT: string;
};

export declare const STUDY_MATERIAL_TYPE: {
    BOOK: string;
    OLD_QUESTION_PAPER_AND_MEMO: string;
    DOCUMENTS: string;
};

export declare const EVENT_TYPE: {
    SCHOOL: string;
    CLASS: string;
    DIVISION: string;
    STUDENT: string;
};

export declare const STORAGE_PATH: {
    PATH: "public/uploads";
};

export declare const SetupStep: {
    CREATE_YEAR: string;
    CREATE_GRADES: string;
    CREATE_CLASSES: string;
    ASSIGN_SUBJECTS: string;
    COMPLETED: string;
};

export declare const DEFAULT_AVTAR: {
    DEFAULT_IMAGE: string;
};
