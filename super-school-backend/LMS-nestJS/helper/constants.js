"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGE_CODE = void 0;

exports.LANGUAGE_CODE = {
    EN: "en",
    AF: "af",
    ZU: "zu",
};

exports.ROLE = {
    MASTER_ADMIN: "super_admin",
    SUB_ADMIN: "admin",
    TEACHER: "teacher",
    PARENTS: "parents",
    STUDENT: "student",
    GUEST_USER: "guest_user",
    DEPARTMENT_OF_EDUCTION: "department_of_education",
    DEPARTMENT: "department",
};

exports.EVENT_TYPE = {
    SCHOOL: "school",
    CLASS: "class",
    DIVISION: "division",
    STUDENT: "student",
};

exports.STUDY_MATERIAL_TYPE = {
    BOOK: "book",
    OLD_QUESTION_PAPER_AND_MEMO: "old_question_paper_and_memo",
    DOCUMENTS: "documents",
};

exports.STORAGE_PATH = {
    PATH: "public/uploads",
};

exports.SetupStep = {
    CREATE_YEAR: "CREATE_YEAR",
    CREATE_GRADES: "CREATE_GRADES",
    CREATE_CLASSES: "CREATE_CLASSES",
    ASSIGN_SUBJECTS: "ASSIGN_SUBJECTS",
    COMPLETED: "COMPLETED",
};

exports.DEFAULT_AVTAR = {
    DEFAULT_IMAGE: "uploads/profile-pic/avatar.png",
};
