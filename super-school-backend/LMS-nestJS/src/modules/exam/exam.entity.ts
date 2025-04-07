import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from "typeorm";
import { Batch } from "../batch/batch.entity";
import { User } from "../users/user.entity";
import { Subject } from "../subject/subject.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";

@Entity("exam")
export class Exam {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ name: "exam_name", nullable: false })
    exam_name: string;

    @Column()
    user_id: number;

    @Column()
    subject_id: number;

    @Column()
    grade_id: number;

    @Column()
    division_id: number;

    @Column()
    batch_id: number;

    @Column()
    memo_url: string;

    @Column({ name: "start_date", nullable: false })
    start_date: string;

    @Column({ name: "end_date", nullable: false })
    end_date: string;

    @Column({ name: "start_time", nullable: false })
    start_time: string;

    @Column({ name: "end_time", nullable: false })
    end_time: string;

    @Column({ name: "status", nullable: false })
    status: string;

    @CreateDateColumn({ name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.exams)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Subject, (subject) => subject.exams)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

    @ManyToOne(() => Batch, (batch) => batch.exams)
    @JoinColumn({ name: "batch_id" })
    batch: Batch;

    @ManyToOne(() => Division, (division) => division.exams)
    @JoinColumn({ name: "division_id" })
    division: Division;

    @ManyToOne(() => Grade, (grade) => grade.exams)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;
}
