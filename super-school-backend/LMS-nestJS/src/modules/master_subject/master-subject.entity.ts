import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, OneToMany } from "typeorm";
import { Subject } from "../subject/subject.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";

@Entity("master_subject")
export class MasterSubject {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    grade_number: string;

    @Column({ unique: true })
    subject_code: string;

    @Column()
    subject_name: string;

    @Column()
    is_language: boolean;

    @CreateDateColumn({ type: "timestamptz", precision: 6 })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at?: Date;

    @OneToMany(() => Subject, (subject) => subject.master_subject)
    subjects: Subject[];

    @OneToMany(() => DivisionSubject, (divisionsubject) => divisionsubject.master_subject)
    divisionSubjects: DivisionSubject[];
}
