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
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";

@Entity("assessments")
export class Assessment {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ name: "assessment_name", type: "varchar", length: 100 })
    assessment_name: string;

    @Column({ name: "assessment_start_datetime", type: "timestamp" })
    assessment_start_datetime: Date;

    @Column({ name: "assessment_end_datetime", type: "timestamp" })
    assessment_end_datetime: Date;

    @ManyToOne(() => Institute, (school) => school.schoolAssessments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "school_id" })
    school_id: Institute;

    @ManyToOne(() => Grade, (grade) => grade.gradeAssessments, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn({ name: "grade_id" })
    grade_id: Grade;

    @ManyToMany(() => Division, (gradeClass) => gradeClass.assessments)
    @JoinTable({
        name: "assessment_grade_classes",
        joinColumn: { name: "assessment_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "grade_class_id", referencedColumnName: "id" },
    })
    grade_class_id: Division[];

    @Column({
        type: "enum",
        enum: ["upcoming", "ongoing", "completed", "cancelled"],
        name: "status",
    })
    status: string;

    @ManyToOne(() => Batch, (batch) => batch.batchAssessments, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "batch_id" })
    batch_id: Batch;

    @ManyToOne(() => Term, (term) => term.termAssessments, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "term_id" })
    term_id: Term;

    @Column({ name: "is_locked", type: "boolean", default: false })
    is_locked: boolean;

    @ManyToOne(() => User, (user) => user.assessmentsCreatedBy, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "created_by" })
    created_by: User;

    @ManyToOne(() => User, (user) => user.assessmentsUpdatedBy, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn({ name: "updated_by" })
    updated_by: User;

    @ManyToOne(() => User, (user) => user.assessmentsDeletedBy, { onDelete: "NO ACTION", nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleted_by: User;

    @CreateDateColumn({ name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({ name: "updated_at", nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deleted_at: Date;

    @OneToMany(() => AssessmentSubject, (assessments) => assessments.assessment_id)
    assessments: AssessmentSubject[];
}
