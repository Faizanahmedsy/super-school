import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Role } from "../role/role.entity";
import { City } from "../city/city.entity";
import { State } from "../state/state.entity";
import { Exam } from "../exam/exam.entity";
import { Batch } from "../batch/batch.entity";
import { Institute } from "../institutes/institutes.entity";
import { Student } from "../student/student.entity";
import { Parent } from "../parents/parents.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Admin } from "../admin/admin.entity";
import { Permission } from "../permissions/permissions.entity";
import { Grade } from "../grade/grade.entity";
import { Subject } from "../subject/subject.entity";
import { Division } from "../division/division.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Term } from "../term/term.entity";
import { OldQuestionPaper } from "../old_question_paper/oldPaper.entity";
import { Module } from "../module/module.entity";
import { Notification } from "../notification/notification.entity";
import { AuditLog } from "../audit_log/audit-log.entity";
import { Department_USER } from "../department_user/department_user.entity";
import { Assessment } from "../assessment/assessment.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { DigitalMarking } from "../digital_markings/digital_markings.entity";
import { ManualMarkingLog } from "../manual_marking_logs/manual_marking_logs.entity";
import { Support } from "../support/support.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({ length: 255 })
    user_name: string;

    @Column()
    role_id: number;

    @Column({ nullable: true })
    school_id: number;

    @Column({ nullable: true, length: 255 })
    status: string;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ type: "timestamp", nullable: true })
    resetTokenExpires: Date;

    @Column({ nullable: true })
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, name: "updated_at" })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, name: "deleted_at" })
    deleted_at?: Date;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @ManyToOne(() => Institute, (institute) => institute.user)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @OneToMany(() => Exam, (exam) => exam.user)
    exams: Exam[];

    @OneToMany(() => Parent, (parent) => parent.user)
    parents: Parent[];

    @OneToMany(() => Student, (student) => student.user)
    students: Student[];

    @OneToMany(() => Teacher, (teacher) => teacher.user)
    teachers: Teacher[];

    @OneToMany(() => Admin, (admin) => admin.createdByUser)
    createdAdmins: Admin[];

    @OneToMany(() => Admin, (admin) => admin.updatedByUser)
    updatedAdmins: Admin[];

    @OneToMany(() => Admin, (admin) => admin.deletedByUser)
    deletedAdmins: Admin[];

    @OneToMany(() => Institute, (institute) => institute.creator)
    createdInstitutes: Institute[];

    @OneToMany(() => Institute, (institute) => institute.updater)
    updatedInstitutes: Institute[];

    @OneToMany(() => Institute, (institute) => institute.deleter)
    deletedInstitutes: Institute[];

    @OneToMany(() => Permission, (permission) => permission.creator)
    createdPermissions: Permission[];

    @OneToMany(() => Permission, (permission) => permission.updater)
    updatedPermissions: Permission[];

    @OneToMany(() => Permission, (permission) => permission.deleter)
    deletedPermissions: Permission[];

    @OneToMany(() => Grade, (grade) => grade.creator)
    createdGrades: Grade[];

    @OneToMany(() => Grade, (grade) => grade.updater)
    updatedGrades: Grade[];

    @OneToMany(() => Grade, (grade) => grade.deleter)
    deletedGrades: Grade[];

    @OneToMany(() => Subject, (subject) => subject.creator)
    createdSubjects: Subject[];

    @OneToMany(() => Subject, (subject) => subject.updater)
    updatedSubjects: Subject[];

    @OneToMany(() => Subject, (subject) => subject.deleter)
    deletedSubjects: Subject[];

    @OneToMany(() => Batch, (batch) => batch.creator)
    createdBatches: Batch[];

    @OneToMany(() => Batch, (batch) => batch.updater)
    updatedBatches: Batch[];

    @OneToMany(() => Batch, (batch) => batch.deleter)
    deletedBatches: Batch[];

    @OneToMany(() => Term, (term) => term.creator)
    createdTerms: Term[];

    @OneToMany(() => Term, (term) => term.updater)
    updatedTerms: Term[];

    @OneToMany(() => Term, (term) => term.deleter)
    deletedTerms: Term[];

    @OneToMany(() => Division, (division) => division.creator)
    createdDivisions: Division[];

    @OneToMany(() => Division, (division) => division.updater)
    updatedDivisions: Division[];

    @OneToMany(() => Division, (division) => division.deleter)
    deletedDivisions: Division[];

    @OneToMany(() => Student, (student) => student.creator)
    createdStudents: Student[];

    @OneToMany(() => Student, (student) => student.updater)
    updatedStudents: Student[];

    @OneToMany(() => Student, (student) => student.deleter)
    deletedStudents: Student[];

    @OneToMany(() => Teacher, (teacher) => teacher.creator)
    createdTeachers: Teacher[];

    @OneToMany(() => Support, (support) => support.creator)
    contactUser: Support[];

    @OneToMany(() => Teacher, (teacher) => teacher.updater)
    updatedTeachers: Teacher[];

    @OneToMany(() => Teacher, (teacher) => teacher.deleter)
    deletedTeachers: Teacher[];

    @OneToMany(() => Parent, (parent) => parent.creator)
    createdParents: Parent[];

    @OneToMany(() => Parent, (parent) => parent.updater)
    updatedParents: Parent[];

    @OneToMany(() => Parent, (parent) => parent.deleter)
    deletedParents: Parent[];

    @OneToMany(() => DivisionSubject, (divisionSubject) => divisionSubject.creator)
    createdDivisionSubjects: DivisionSubject[];

    @OneToMany(() => DivisionSubject, (divisionSubject) => divisionSubject.updater)
    updatedDivisionSubjects: DivisionSubject[];

    @OneToMany(() => DivisionSubject, (divisionSubject) => divisionSubject.deleter)
    deletedDivisionSubjects: DivisionSubject[];

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.creator)
    createdPaper: OldQuestionPaper[];

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.updater)
    updatedPaper: OldQuestionPaper[];

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.deleter)
    deletedPaper: OldQuestionPaper[];

    @OneToMany(() => Module, (module) => module.creator)
    createdModule: Module[];

    @OneToMany(() => Module, (module) => module.updater)
    updatedModule: Module[];

    @OneToMany(() => Module, (module) => module.deleter)
    deletedModule: Module[];

    @OneToMany(() => Notification, (notification) => notification.creator)
    createdNotification: Notification[];

    @OneToMany(() => Notification, (notification) => notification.updater)
    updatedNotification: Notification[];

    @OneToMany(() => Notification, (notification) => notification.to_user)
    notifications_to_user: Notification[];

    @OneToMany(() => Notification, (notification) => notification.deleter)
    deletedNotification: Notification[];

    @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
    auditlog: AuditLog[];

    @OneToMany(() => Department_USER, (department_user) => department_user.createdByUser)
    createdDepartment: Department_USER[];

    @OneToMany(() => Department_USER, (department_user) => department_user.updatedByUser)
    updatedDepartment: Department_USER[];

    @OneToMany(() => Department_USER, (department_user) => department_user.deletedByUser)
    deletedDepartment: Department_USER[];

    @OneToMany(() => Assessment, (assessmentsCreatedBy) => assessmentsCreatedBy.created_by)
    assessmentsCreatedBy: Assessment[];

    @OneToMany(() => Assessment, (assessmentsUpdatedBy) => assessmentsUpdatedBy.updated_by)
    assessmentsUpdatedBy: Assessment[];

    @OneToMany(() => Assessment, (assessmentsDeletedBy) => assessmentsDeletedBy.deleted_by)
    assessmentsDeletedBy: Assessment[];

    @OneToMany(() => AssessmentSubject, (createdAssessmentSubjects) => createdAssessmentSubjects.created_by)
    createdAssessmentSubjects: AssessmentSubject[];

    @OneToMany(() => AssessmentSubject, (updatedAssessmentSubjects) => updatedAssessmentSubjects.updated_by)
    updatedAssessmentSubjects: AssessmentSubject[];

    @OneToMany(() => AssessmentSubject, (deletedAssessmentSubjects) => deletedAssessmentSubjects.deleted_by)
    deletedAssessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (createdStudentAnswerSheets) => createdStudentAnswerSheets.created_by)
    createdStudentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => StudentAnswerSheet, (updatedStudentAnswerSheets) => updatedStudentAnswerSheets.updated_by)
    updatedStudentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => StudentAnswerSheet, (deletedStudentAnswerSheets) => deletedStudentAnswerSheets.deleted_by)
    deletedStudentAnswerSheets: StudentAnswerSheet[];

    // @OneToMany(() => DigitalMarking, (digitalMarkingsCreatedBy) => digitalMarkingsCreatedBy.created_by)
    // digitalMarkingsCreatedBy: DigitalMarking[];

    @OneToMany(() => DigitalMarking, (digitalMarkingsUpdatedBy) => digitalMarkingsUpdatedBy.updated_by)
    digitalMarkingsUpdatedBy: DigitalMarking[];

    @OneToMany(() => DigitalMarking, (digitalMarkingsDeletedBy) => digitalMarkingsDeletedBy.deleted_by)
    digitalMarkingsDeletedBy: DigitalMarking[];

    @OneToMany(() => ManualMarkingLog, (manualMarkingLogsDoneBy) => manualMarkingLogsDoneBy.done_by_id)
    manualMarkingLogsDoneBy: ManualMarkingLog[];
}
