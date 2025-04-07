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
    ManyToMany,
    DeleteDateColumn,
    JoinTable,
} from "typeorm";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Grade } from "../grade/grade.entity";
import { Exam } from "../exam/exam.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Student } from "../student/student.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Subject } from "../subject/subject.entity";
import { Event } from "../calendar_event/event.entity";
import { Notification } from "../notification/notification.entity";
import { Batch } from "../batch/batch.entity";
import { Assessment } from "../assessment/assessment.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { TimeTable } from "../time_table/time_table.entity";

@Entity("grade_classes")
export class Division {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    name: string;

    @Column()
    grade_id: number;

    @Column()
    school_id: number;

    @Column({ nullable: true })
    batch_id: number;

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6 })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => Batch, (institute) => institute.divisions)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Institute, (institute) => institute.divisions)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => Grade, (grade) => grade.divisions)
    @JoinColumn({ name: "grade_id" })
    grades: Grade;

    @ManyToMany(() => Subject, (subject) => subject.divisions, { cascade: true })
    @JoinTable({
        name: "grade_classes_subjects",
        joinColumns: [
            {
                name: "gradeclass_id",
                referencedColumnName: "id",
            },
        ],
        inverseJoinColumns: [
            {
                name: "subject_id",
                referencedColumnName: "id",
            },
        ],
    })
    subjects: Subject[];

    @OneToMany(() => Student, (student) => student.division)
    students: Student[];

    @OneToMany(() => Exam, (exam) => exam.division)
    exams: Exam[];

    @OneToMany(() => DivisionSubject, (divisionSubject) => divisionSubject.division)
    divisionSubjects: DivisionSubject[];

    @ManyToOne(() => User, (user) => user.createdDivisions, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedDivisions, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedDivisions, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    @OneToMany(() => Event, (event) => event.division)
    events: Event[];

    @OneToMany(() => Notification, (notification) => notification.division)
    notification: Notification[];

    @ManyToMany(() => Assessment, (notification) => notification.grade_class_id)
    assessments: Assessment[];

    @OneToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.grade_class_id)
    assessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (studentAnswerSheets) => studentAnswerSheets.grade_class)
    studentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => TimeTable, (timeTable) => timeTable.division)
    timeTable: TimeTable[];
}
