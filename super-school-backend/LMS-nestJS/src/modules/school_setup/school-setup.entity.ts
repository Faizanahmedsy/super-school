import { SetupStep } from "helper/constants";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
// import { SetupStep } from "../enums/setup-step.enum";

@Entity("school_setup")
export class SchoolSetup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    admin_id: number;

    @Column()
    school_id: number;

    @Column()
    batch_id: number;

    @Column({ name: "current_step", enum: SetupStep, default: SetupStep.CREATE_YEAR })
    current_step: string;

    @Column("jsonb", { nullable: true })
    year_data: any;

    @Column("jsonb", { nullable: true })
    grades_data: any;

    @Column("jsonb", { nullable: true })
    classes_data: any;

    @Column("jsonb", { nullable: true })
    subjects_data: any;

    @Column({ default: false })
    is_completed: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
