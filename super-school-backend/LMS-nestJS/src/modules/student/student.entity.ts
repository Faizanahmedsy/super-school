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
import { Role } from "../role/role.entity";
import { Parent } from "../parents/parents.entity";
import { Division } from "../division/division.entity";
import { Batch } from "../batch/batch.entity";
import { Subject } from "../subject/subject.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Term } from "../term/term.entity";
import { Grade } from "../grade/grade.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { LessonPlans } from "../lesson_plans/lesson_plans.entity";

@Entity("students")
export class Student {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ default: "" })
    addmission_no: string;

    @Column({ name: "first_name" })
    first_name: string;

    @Column({ name: "last_name" })
    last_name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    mobile_number: string;

    @Column({ nullable: true, length: 255 })
    gender: string;

    @Column({ nullable: true, length: 255 })
    date_of_birth: string;

    @Column({ nullable: true })
    profile_image: string;

    @Column()
    school_id: number;

    @Column()
    student_user_id: number;

    @Column()
    role_id: number;

    @Column()
    cur_batch_id: number;

    @Column({ default: null })
    grade_id: number;

    @Column()
    grade_class_id: number;

    @Column({ nullable: true })
    extra_activity: string;

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, name: "updated_at", nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, name: "deleted_at", nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => Institute, (institute) => institute.students)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => User, (user) => user.students)
    @JoinColumn({ name: "student_user_id" })
    user: User;

    @ManyToOne(() => Role, (role) => role.students)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @ManyToMany(() => Parent, (parent) => parent.students)
    @JoinTable({
        name: "students_parents", // Join table name
        joinColumns: [
            {
                name: "student_id", // Column in the join table
                referencedColumnName: "id", // Primary key in Student entity
            },
        ],
        inverseJoinColumns: [
            {
                name: "parent_id", // Column in the join table
                referencedColumnName: "id", // Primary key in Parent entity
            },
        ],
    })
    parents: Parent[];

    @ManyToMany(() => DivisionSubject, (divisionSubject) => divisionSubject.students, { cascade: true })
    divisionSubjects: DivisionSubject[];

    @OneToMany(() => LessonPlans, (lessonPlans) => lessonPlans.student, { cascade: true })
    lessonPlans: LessonPlans[];

    @ManyToOne(() => Batch, (batch) => batch.students)
    @JoinColumn({ name: "cur_batch_id" })
    batch: Batch;

    @ManyToOne(() => Division, (division) => division.students)
    @JoinColumn({ name: "grade_class_id" })
    division: Division;

    @ManyToOne(() => Grade, (division) => division.students)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => User, (user) => user.createdStudents, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedStudents, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedStudents, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    @ManyToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.student_id)
    assessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (studentAnswerSheets) => studentAnswerSheets.student)
    studentAnswerSheets: StudentAnswerSheet[];

    // @ManyToOne(() => Term, (term) => term.students)
    // @JoinColumn({ name: "cur_term_id" })
    // terms: Term;
}
