import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Subject } from "../subject/subject.entity";
import { Grade } from "../grade/grade.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";

@Entity("old_question_papers")
export class OldQuestionPaper {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paper_name: string;

    @Column({ type: "date" })
    paper_exam_date: Date;

    @Column()
    paper_path: string;

    @Column()
    subject_id: number;

    @Column()
    grade_id: number;

    @Column()
    batch_id: number;

    @Column()
    term_id: number;

    @Column({default:null })
    school_id: number;

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => Subject, (subject) => subject.oldPaper)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

    @ManyToOne(() => Grade, (grade) => grade.oldPaper)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => Batch, (batch) => batch.oldPaper)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Institute, (institute) => institute.oldPaper)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => Term, (term) => term.oldPaper)
    @JoinColumn({ name: "term_id" })
    term: Term;

    @ManyToOne(() => User, (user) => user.createdPaper, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedPaper, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedPaper, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}
