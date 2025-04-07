import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
} from "typeorm";
import { Assessment } from "../assessment/assessment.entity";
import { Subject } from "../subject/subject.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";
import { Institute } from "../institutes/institutes.entity";
import { Student } from "../student/student.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { User } from "../users/user.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";

@Entity("assessment_subjects")
export class AssessmentSubject {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Assessment, (assessment) => assessment.assessments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "assessment_id" })
    assessment_id: Assessment;

    @ManyToOne(() => Subject, (subject) => subject.assessmentSubjects, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "subject_id" })
    subject_id: Subject;

    @ManyToOne(() => Grade, (grade) => grade.assessmentSubjects, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "grade_id" })
    grade_id: Grade;

    @ManyToOne(() => Division, (gradeClass) => gradeClass.assessmentSubjects, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "grade_class_id" })
    grade_class_id: Division;

    @ManyToOne(() => Institute, (school) => school.assessmentSubjects, { onDelete: "CASCADE" })
    @JoinColumn({ name: "school_id" })
    school_id: Institute;

    @ManyToMany(() => Student, (student) => student.assessmentSubjects)
    @JoinTable({
        name: "assessment_subjects_student",
        joinColumn: { name: "assessment_subject_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "student_id", referencedColumnName: "id" },
    })
    student_id: Student[];

    @Column({ nullable: true })
    memorandom: string;

    @Column({ nullable: true })
    question_paper: string;

    @Column({ name: "assessment_start_datetime", type: "timestamp" })
    assessment_start_datetime: Date;

    @Column({ name: "assessment_end_datetime", type: "timestamp" })
    assessment_end_datetime: Date;

    @Column({ nullable: true })
    paper_title: string;

    @Column({ type: "varchar", length: 100 })
    status: "upcoming" | "ongoing" | "completed" | "cancelled";

    @ManyToOne(() => Batch, (batch) => batch.assessmentSubjects, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "batch_id" })
    batch_id: Batch;

    @ManyToOne(() => Term, (term) => term.assessmentSubjects, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "term_id" })
    term_id: Term;

    @Column({ default: false })
    is_locked: boolean;

    @ManyToOne(() => User, (user) => user.createdAssessmentSubjects, { nullable: true })
    @JoinColumn({ name: "created_by" })
    created_by: User;

    @ManyToOne(() => User, (user) => user.updatedAssessmentSubjects, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updated_by: User;

    @ManyToOne(() => User, (user) => user.deletedAssessmentSubjects, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleted_by: User;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @OneToMany(() => StudentAnswerSheet, (assessment_subject) => assessment_subject.assessment_subject)
    studentAnswerSheets: StudentAnswerSheet[];
}
