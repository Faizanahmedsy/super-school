import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { Institute } from "../institutes/institutes.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { User } from "../users/user.entity";
import { ManualMarkingLog } from "../manual_marking_logs/manual_marking_logs.entity";

@Entity("digital_markings")
export class DigitalMarking {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @ManyToOne(() => StudentAnswerSheet, (studentAnswerSheet) => studentAnswerSheet.digitalMarkings)
    @JoinColumn({ name: "student_answer_sheet_id" })
    student_answer_sheet: StudentAnswerSheet;

    @ManyToOne(() => Institute, (school) => school.digitalMarkings)
    @JoinColumn({ name: "school_id" })
    school_id: Institute;

    @Column()
    question_number: string;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column("json")
    not_detected_word: string[];

    @Column()
    confidence_score: number;

    @Column("float")
    actual_mark: number;

    @Column("float")
    obtained_mark: number;

    @Column("float", { nullable: true, default: null })
    obtained_manual_mark: number | null;

    @Column()
    reason: string;

    @Column({ nullable: true, default: null })
    teacher_reason: string | null;

    @Column()
    strength: string;

    @Column()
    weakness: string;

    @ManyToOne(() => Batch, (batch) => batch.digitalMarkings)
    @JoinColumn({ name: "batch_id" })
    batch_id: Batch;

    @ManyToOne(() => Term, (term) => term.digitalMarkings)
    @JoinColumn({ name: "term_id" })
    term_id: Term;

    @ManyToOne(() => User, (user) => user.digitalMarkingsUpdatedBy, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updated_by: User;

    @ManyToOne(() => User, (user) => user.digitalMarkingsDeletedBy, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleted_by: User;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @OneToMany(() => ManualMarkingLog, (manualMarkingLogs) => manualMarkingLogs.digital_marking_id)
    manualMarkingLogs: ManualMarkingLog[];
}
