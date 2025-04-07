import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";
import { User } from "../users/user.entity";
import { Student } from "../student/student.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { Institute } from "../institutes/institutes.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";
import { DigitalMarking } from "../digital_markings/digital_markings.entity";

@Entity("student_answer_sheets")
export class StudentAnswerSheet {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.studentAnswerSheets)
    @JoinColumn({ name: "student_id" })
    student: Student;

    @ManyToOne(() => AssessmentSubject, (assessmentSubject) => assessmentSubject.studentAnswerSheets)
    @JoinColumn({ name: "assessment_subject_id" })
    assessment_subject: AssessmentSubject;

    @ManyToOne(() => Institute, (school) => school.studentAnswerSheets)
    @JoinColumn({ name: "school_id" })
    school: Institute;

    @Column("text")
    answer_sheet: string; // Store path to the uploaded file

    @ManyToOne(() => Batch, (batch) => batch.studentAnswerSheets)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Term, (term) => term.studentAnswerSheets)
    @JoinColumn({ name: "term_id" })
    term: Term;

    @ManyToOne(() => Grade, (grade) => grade.studentAnswerSheets)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => Division, (gradeClass) => gradeClass.studentAnswerSheets)
    @JoinColumn({ name: "grade_class_id" })
    grade_class: Division;

    @Column({ type: "text", nullable: true, default: null })
    feedback: string;

    @Column({ type: "boolean", default: false })
    ocr_status: boolean;

    @Column({ type: "boolean", default: false })
    is_locked: boolean;

    @ManyToOne(() => User, (user) => user.createdStudentAnswerSheets)
    @JoinColumn({ name: "created_by" })
    created_by: User;

    @ManyToOne(() => User, (user) => user.updatedStudentAnswerSheets, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updated_by: User;

    @ManyToOne(() => User, (user) => user.deletedStudentAnswerSheets, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleted_by: User;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @OneToMany(() => DigitalMarking, (digitalMarkings) => digitalMarkings.student_answer_sheet)
    digitalMarkings: DigitalMarking[];
}
