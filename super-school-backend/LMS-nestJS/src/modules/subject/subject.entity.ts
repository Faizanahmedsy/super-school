import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    DeleteDateColumn,
    Timestamp,
    JoinTable,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { Exam } from "../exam/exam.entity";
import { Institute } from "../institutes/institutes.entity";
import { User } from "../users/user.entity";
import { Division } from "../division/division.entity";
import { Student } from "../student/student.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { OldQuestionPaper } from "../old_question_paper/oldPaper.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { Grade } from "../grade/grade.entity";
import { MasterSubject } from "../master_subject/master-subject.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { TimeTable } from "../time_table/time_table.entity";

@Entity("subjects")
export class Subject {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ default: null })
    master_subject_id: number;

    @Column()
    school_id: number;

    @Column()
    grade_id: number;

    // @Column()
    // term_id: number;

    @Column()
    batch_id: number;

    @ManyToOne(() => Institute, (institute) => institute.subjects)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => Batch, (batch) => batch.subjects)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    // @ManyToOne(() => Term, (batch) => batch.subjects)
    // @JoinColumn({ name: "term_id" })
    // term: Term;

    @ManyToOne(() => Grade, (batch) => batch.subjects)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => MasterSubject, (batch) => batch.subjects)
    @JoinColumn({ name: "master_subject_id" })
    master_subject: MasterSubject;

    @ManyToOne(() => User, (user) => user.createdSubjects, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedSubjects, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedSubjects, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;

    @OneToMany(() => Exam, (exam) => exam.subject)
    exams: Exam[];

    @OneToMany(() => DivisionSubject, (divisionSubject) => divisionSubject.subject)
    divisionSubjects: DivisionSubject[];

    @ManyToMany(() => Division, (division) => division.subjects)
    @JoinTable({
        name: "grade_classes_subjects",
        joinColumn: { name: "subject_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "gradeclass_id", referencedColumnName: "id" },
    })
    divisions: Division[];

    @OneToMany(() => TimeTable, (timeTable) => timeTable.subject)
    timeTable: TimeTable[];

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, name: "updated_at" })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, name: "deleted_at" })
    deleted_at?: Date;

    @OneToMany(() => OldQuestionPaper, (OldQuestionPaper) => OldQuestionPaper.subject)
    oldPaper: OldQuestionPaper[];

    @OneToMany(() => AssessmentSubject, (assessmentSubjects) => assessmentSubjects.subject_id)
    assessmentSubjects: AssessmentSubject[];
}
