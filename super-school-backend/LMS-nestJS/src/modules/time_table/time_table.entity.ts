import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    JoinColumn,
} from "typeorm";
import { Institute } from "../institutes/institutes.entity";
import { Grade } from "../grade/grade.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { User } from "../users/user.entity";
import { Division } from "../division/division.entity";
import { Subject } from "../subject/subject.entity";
@Entity("time_table")
export class TimeTable {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ type: "varchar", length: 100 })
    assessment_name: string;

    @Column({ type: "varchar", length: 100 })
    paper_title: string;

    @Column({ type: "timestamp" })
    start_date: string;

    @Column({ type: "timestamp" })
    end_date: string;

    @Column()
    start_time: string;

    @Column()
    end_time: string;

    @Column()
    school_id: number;

    @Column()
    grade_id: number;

    @Column()
    class_id: number;

    @Column()
    batch_id: number;

    @Column()
    subject_id: number;

    @Column()
    term_id: number;

    @ManyToOne(() => Institute, (institute) => institute.timeTable)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => Grade, (grade) => grade.timeTable)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => Division, (division) => division.timeTable)
    @JoinColumn({ name: "class_id" })
    division: Division;

    @ManyToOne(() => Batch, (batch) => batch.timeTable)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Subject, (subject) => subject.timeTable)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

    @ManyToOne(() => Term, (term) => term.timeTable)
    @JoinColumn({ name: "term_id" })
    term: Term;

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
}
