import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
    OneToOne,
} from "typeorm";
import { User } from "../users/user.entity";
import { City } from "../city/city.entity";
import { State } from "../state/state.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Parent } from "../parents/parents.entity";
import { Student } from "../student/student.entity";
import { Batch } from "../batch/batch.entity";
import { Grade } from "../grade/grade.entity";
import { Subject } from "../subject/subject.entity";
import { Permission } from "../permissions/permissions.entity";
import { Admin } from "../admin/admin.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Term } from "../term/term.entity";
import { Notification } from "../notification/notification.entity";
import { Event } from "../calendar_event/event.entity";
import { AuditLog } from "../audit_log/audit-log.entity";
import { OldQuestionPaper } from "../old_question_paper/oldPaper.entity";
import { Assessment } from "../assessment/assessment.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { DigitalMarking } from "../digital_markings/digital_markings.entity";
import { ManualMarkingLog } from "../manual_marking_logs/manual_marking_logs.entity";
import { TimeTable } from "../time_table/time_table.entity";
import { Support } from "../support/support.entity";
@Entity("schools")
export class Institute {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ length: 255 })
    school_name: string;

    @Column()
    district_id: number;

    @Column()
    province_id: number;

    @Column({ length: 255 })
    school_type: string;

    @Column({ length: 255 })
    medium_of_instruction: string;

    @Column({ length: 255 })
    EMIS_number: string;

    @Column({ length: 255, default: "" })
    address: string;

    @Column({ length: 255 })
    location_type: string;

    @Column({ nullable: true })
    contact_number: string;

    @Column()
    contact_person: string;

    @Column({ length: 255 })
    contact_email: string;

    @Column({ nullable: true })
    themePrimaryColor: string;

    @Column({ nullable: true })
    themeSecondaryColor: string;

    @Column({ nullable: true })
    logo: string;

    @Column()
    max_users: number;

    @Column({ default: 0 })
    current_users: number;

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @Column({ nullable: false, default: false })
    setup: boolean;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => City, (city) => city.institute)
    @JoinColumn({ name: "district_id" })
    city: City;

    @ManyToOne(() => State, (state) => state.institute)
    @JoinColumn({ name: "province_id" })
    state: State;

    @OneToMany(() => User, (user) => user.institute)
    user: User[];

    @OneToMany(() => Teacher, (teacher) => teacher.institute)
    teachers: Teacher[];

    @OneToMany(() => Parent, (parent) => parent.institute)
    parents: Parent[];

    @OneToMany(() => Student, (student) => student.institute)
    students: Student[];

    @OneToMany(() => Batch, (batch) => batch.institute)
    batches: Batch[];

    @OneToMany(() => Grade, (grade) => grade.institute)
    grades: Grade[];

    @OneToMany(() => Student, (division) => division.institute)
    divisions: Student[];

    @OneToMany(() => Subject, (subject) => subject.institute)
    subjects: Subject[];

    // @OneToMany(() => Permission, (permission) => permission.institute)
    // permissions: Permission[];

    @OneToMany(() => Admin, (admin) => admin.institute)
    admins: Admin[];

    @OneToMany(() => DivisionSubject, (divisionSubjects) => divisionSubjects.institute)
    divisionSubjects: DivisionSubject[];

    @OneToMany(() => Term, (term) => term.institute)
    terms: Term[];

    @ManyToOne(() => User, (user) => user.createdInstitutes, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedInstitutes, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedInstitutes, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    @OneToMany(() => Notification, (notification) => notification.institute)
    notification: Notification[];

    @OneToMany(() => Event, (event) => event.institute)
    events: Event[];

    @OneToMany(() => AuditLog, (auditLog) => auditLog.institute)
    auditlog: Event[];

    @OneToMany(() => OldQuestionPaper, (old_question_paper) => old_question_paper.institute)
    oldPaper: OldQuestionPaper[];

    @OneToMany(() => Assessment, (schoolAssessments) => schoolAssessments.school_id)
    schoolAssessments: Assessment[];

    @OneToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.school_id)
    assessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (studentAnswerSheets) => studentAnswerSheets.school)
    studentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => DigitalMarking, (digitalMarkings) => digitalMarkings.school_id)
    digitalMarkings: DigitalMarking[];

    @OneToMany(() => ManualMarkingLog, (manualMarkingLogsSchool) => manualMarkingLogsSchool.school_id)
    manualMarkingLogsSchool: ManualMarkingLog[];

    @OneToMany(() => TimeTable, (timeTable) => timeTable.institute)
    timeTable: TimeTable[];

    @OneToMany(() => Support, (support) => support.institute)
    support: Support[];
}
