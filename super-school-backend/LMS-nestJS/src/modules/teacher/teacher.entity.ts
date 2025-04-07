import { permission } from "process";
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
    JoinTable,
    ManyToMany,
    DeleteDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Role } from "../role/role.entity";
import { Division } from "../division/division.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";

@Entity("teachers")
export class Teacher {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ name: "first_name" })
    first_name: string;

    @Column({ name: "last_name" })
    last_name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    mobile_number: string;

    @Column({ nullable: true, length: 255 })
    gender: string;

    @Column({ nullable: true, length: 255 })
    subject_specialization: string;

    @Column({ nullable: true })
    date_of_birth: string;

    @Column({ nullable: true })
    hire_date: string;

    @Column({ nullable: true })
    profile_image: string;

    @Column({ nullable: true })
    extra_activity: string;

    @Column()
    school_id: number;

    @Column()
    teacher_user_id: number;

    @Column()
    role_id: number;

    @Column({ nullable: true })
    cur_batch_id: number;

    @Column({ length: 255, nullable: false, default: 0 })
    sace_number: string;

    @Column({ length: 255, nullable: true })
    persal_number: string;

    // @Column({ nullable: true })
    // cur_term_id: number;

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

    @ManyToOne(() => Institute, (institute) => institute.teachers)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @OneToMany(() => User, (user) => user.teachers)
    @JoinColumn({ name: "teacher_user_id" })
    user: User[];

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @ManyToOne(() => Batch, (batch) => batch.teachers)
    @JoinColumn({ name: "cur_batch_id" })
    batch: Batch;

    // @ManyToOne(() => Term, (term) => term.teachers)
    // @JoinColumn({ name: "cur_term_id" })
    // terms: Term;

    @OneToMany(() => DivisionSubject, (divisionsubject) => divisionsubject.teacher)
    divisionSubjects: DivisionSubject[];

    @ManyToOne(() => User, (user) => user.createdTeachers, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedTeachers, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedTeachers, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}
