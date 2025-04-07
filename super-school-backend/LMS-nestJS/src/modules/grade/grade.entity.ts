import { permission } from "process";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
    ManyToOne,
    DeleteDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Role } from "../role/role.entity";
import { Exam } from "../exam/exam.entity";
import { Division } from "../division/division.entity";
import { OldQuestionPaper } from "../old_question_paper/oldPaper.entity";
import { Subject } from "../subject/subject.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { StudentModule } from "../student/student.module";
import { Student } from "../student/student.entity";
import { Notification } from "../notification/notification.entity";
import { Event } from "../calendar_event/event.entity";
import { Batch } from "../batch/batch.entity";
import { Assessment } from "../assessment/assessment.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { TimeTable } from "../time_table/time_table.entity";

@Entity("grades")
export class Grade {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    grade_number: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    batch_id: number;

    @Column()
    school_id: number;

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => Batch, (batch) => batch.grades)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Institute, (institute) => institute.grades)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @OneToMany(() => User, (user) => user)
    @JoinColumn({ name: "created_by" })
    users: User[];

    @OneToMany(() => Division, (division) => division.grades)
    divisions: Division[];

    @OneToMany(() => Exam, (exam) => exam.grade)
    exams: Exam[];

    @ManyToOne(() => User, (user) => user.createdGrades, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @OneToMany(() => Subject, (subject) => subject.grade)
    subjects: Subject[];

    @ManyToOne(() => User, (user) => user.updatedGrades, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @OneToMany(() => DivisionSubject, (divisionsubject) => divisionsubject.grade)
    divisionSubjects: DivisionSubject[];

    @OneToMany(() => Student, (student) => student.grade)
    students: Student[];

    @ManyToOne(() => User, (user) => user.deletedGrades, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.grade)
    oldPaper: OldQuestionPaper[];

    @OneToMany(() => Notification, (notification) => notification.grade)
    notification: Notification[];

    @OneToMany(() => Event, (event) => event.grade)
    events: Event[];

    @OneToMany(() => Assessment, (gradeAssessments) => gradeAssessments.grade_id)
    gradeAssessments: Assessment[];

    @OneToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.grade_id)
    assessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (studentAnswerSheets) => studentAnswerSheets.grade)
    studentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => TimeTable, (timeTable) => timeTable.grade)
    timeTable: TimeTable[];
}
