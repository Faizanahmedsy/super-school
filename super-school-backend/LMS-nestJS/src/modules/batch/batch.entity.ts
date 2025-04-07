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
import { Exam } from "../exam/exam.entity";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Student } from "../student/student.entity";
import { Term } from "../term/term.entity";
import { Teacher } from "../teacher/teacher.entity";
import { OldQuestionPaper } from "../old_question_paper/oldPaper.entity";
import { Subject } from "../subject/subject.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";
import { Assessment } from "../assessment/assessment.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { DigitalMarking } from "../digital_markings/digital_markings.entity";
import { TimeTable } from "../time_table/time_table.entity";

@Entity("batches")
export class Batch {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    start_year: number;

    @Column()
    school_id: number;

    @Column({ default: false })
    is_active: boolean;

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

    @ManyToOne(() => Institute, (institute) => institute.batches)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @OneToMany(() => Exam, (exam) => exam.batch)
    exams: Exam[];

    @OneToMany(() => Student, (student) => student.batch)
    students: Student[];

    @ManyToOne(() => User, (user) => user.createdBatches, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedBatches, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedBatches, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    @OneToMany(() => Term, (term) => term.batch)
    terms: Term[];

    @OneToMany(() => Teacher, (teacher) => teacher.batch)
    teachers: Teacher[];

    @OneToMany(() => Subject, (subject) => subject.batch)
    subjects: Subject[];

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.batch)
    oldPaper: OldQuestionPaper[];

    @OneToMany(() => DivisionSubject, (divisionsubject) => divisionsubject.batch)
    divisionSubjects: DivisionSubject[];

    @OneToMany(() => Grade, (grade) => grade.batch)
    grades: Grade[];

    @OneToMany(() => Division, (grade) => grade.batch)
    divisions: Division[];

    @OneToMany(() => Assessment, (batchAssessments) => batchAssessments.batch_id)
    batchAssessments: Assessment[];

    @OneToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.batch_id)
    assessmentSubjects: AssessmentSubject[];

    @OneToMany(() => StudentAnswerSheet, (studentAnswerSheets) => studentAnswerSheets.batch)
    studentAnswerSheets: StudentAnswerSheet[];

    @OneToMany(() => DigitalMarking, (digitalMarkings) => digitalMarkings.batch_id)
    digitalMarkings: DigitalMarking[];

    @OneToMany(() => TimeTable, (timeTable) => timeTable.batch)
    timeTable: TimeTable[];
}
