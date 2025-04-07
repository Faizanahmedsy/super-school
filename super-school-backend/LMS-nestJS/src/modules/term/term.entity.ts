import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, OneToMany } from "typeorm";
import { Batch } from "../batch/batch.entity";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Student } from "../student/student.entity";
import { Teacher } from "../teacher/teacher.entity";
import { OldQuestionPaper } from "../old_question_paper/oldPaper.entity";
import { Subject } from "../subject/subject.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Assessment } from "../assessment/assessment.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { DigitalMarking } from "../digital_markings/digital_markings.entity";
import { TimeTable } from "../time_table/time_table.entity";

@Entity("terms")
export class Term {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    term_name: string;

    @Column()
    batch_id: number;

    @Column()
    school_id: number;

    @Column()
    status: boolean;

    @Column({ name: "start_date", nullable: true })
    start_date: string;

    @Column({ name: "end_date", nullable: true })
    end_date: string;

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

    @ManyToOne(() => Batch, (batch) => batch.terms)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Institute, (institute) => institute.terms)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => User, (user) => user.createdTerms, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedTerms, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedTerms, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    // @OneToMany(() => Student, (student) => student.terms)
    // students: Student[];

    // @OneToMany(() => Teacher, (teacher) => teacher.terms)
    // teachers: Teacher[];

    // @OneToMany(() => Subject, (subject) => subject.term)
    // subjects: Subject[];

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.term)
    oldPaper: OldQuestionPaper[];

    @OneToMany(() => DivisionSubject, (divisionsubject) => divisionsubject.term)
    divisionSubjects: DivisionSubject[];

    @OneToMany(() => Assessment, (termAssessments) => termAssessments.term_id)
    termAssessments: Assessment[];

    @OneToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.term_id)
    assessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (studentAnswerSheets) => studentAnswerSheets.term)
    studentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => DigitalMarking, (digitalMarkings) => digitalMarkings.term_id)
    digitalMarkings: DigitalMarking[];

    @OneToMany(() => TimeTable, (timeTable) => timeTable.term)
    timeTable: TimeTable[];
}
