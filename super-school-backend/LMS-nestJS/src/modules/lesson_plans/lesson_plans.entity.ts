import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    DeleteDateColumn,
    OneToMany,
} from "typeorm";
import { Division } from "../division/division.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Subject } from "../subject/subject.entity";
import { Institute } from "../institutes/institutes.entity";
import { Student } from "../student/student.entity";
import { User } from "../users/user.entity";
import { Grade } from "../grade/grade.entity";
import { MasterSubject } from "../master_subject/master-subject.entity";
import { Term } from "../term/term.entity";
import { Batch } from "../batch/batch.entity";

@Entity("lesson_plans")
export class LessonPlans {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    school_id: number;

    @Column()
    grade_id: number;

    @Column()
    grade_class_id: number;

    @Column()
    subject_id: number;

    @Column()
    master_subject_id: number;

    @Column()
    teacher_id: number;

    @Column()
    term_id: number;

    @Column()
    batch_id: number;

    @Column()
    title: string;

    @Column()
    activity: string;

    @Column()
    date: string;

    @Column()
    start_time: string;

    @Column()
    end_time: string;

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

    @ManyToOne(() => Teacher, (teacher) => teacher.divisionSubjects)
    @JoinColumn({ name: "teacher_id" })
    teacher: Teacher;

    @ManyToOne(() => Grade, (teacher) => teacher.divisionSubjects)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => MasterSubject, (teacher) => teacher.divisionSubjects)
    @JoinColumn({ name: "master_subject_id" })
    master_subject: MasterSubject;

    @ManyToOne(() => Term, (teacher) => teacher.divisionSubjects)
    @JoinColumn({ name: "term_id" })
    term: Term;

    @ManyToOne(() => Batch, (teacher) => teacher.divisionSubjects)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Division, (division) => division.divisionSubjects)
    @JoinColumn({ name: "grade_class_id" })
    division: Division;

    @OneToMany(() => Student, (student) => student.lessonPlans)
    @JoinTable({
        name: "lesson_plan_students",
        joinColumn: {
            name: "lessonplans_id",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "student_id",
            referencedColumnName: "id",
        },
    })
    student: Student[];

    @ManyToOne(() => Subject, (subject) => subject.divisionSubjects)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

    @ManyToOne(() => Institute, (institute) => institute.divisionSubjects)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => User, (user) => user.createdDivisionSubjects, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedDivisionSubjects, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedDivisionSubjects, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}
