import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from "typeorm";
import { Division } from "../division/division.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Subject } from "../subject/subject.entity";
import { User } from "../users/user.entity";
import { Grade } from "../grade/grade.entity";
import { MasterSubject } from "../master_subject/master-subject.entity";
import { Term } from "../term/term.entity";
import { Batch } from "../batch/batch.entity";
import { STUDY_MATERIAL_TYPE } from "helper/constants";

@Entity("study_materials")
export class StudyMaterial {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ name: "type", enum: STUDY_MATERIAL_TYPE, nullable: false })
    type: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    topic: string;

    @Column({ nullable: true })
    file: string;

    @Column({ nullable: true })
    url: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    month: string;

    @Column({ nullable: true })
    batch_id: number;

    @Column({ nullable: true })
    subject_id: number;

    @Column({ nullable: true })
    school_id: number;

    @Column({ nullable: true })
    master_subject_id: number;

    @Column({ nullable: true })
    grade_id: number;

    @Column({ nullable: true })
    term_id: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    question_paper: string;

    @Column({ nullable: true })
    paper_memo: string;

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

    @ManyToOne(() => Grade, (grade) => grade.divisionSubjects)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => MasterSubject, (master_subject) => master_subject.divisionSubjects)
    @JoinColumn({ name: "master_subject_id" })
    master_subject: MasterSubject;

    @ManyToOne(() => Term, (term) => term.divisionSubjects)
    @JoinColumn({ name: "term_id" })
    term: Term;

    @ManyToOne(() => Batch, (batch) => batch.divisionSubjects)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Subject, (subject) => subject.divisionSubjects)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

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
