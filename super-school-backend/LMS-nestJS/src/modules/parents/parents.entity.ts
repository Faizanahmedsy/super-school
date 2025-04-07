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
import { Student } from "../student/student.entity";

@Entity("parents")
export class Parent {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ nullable: true })
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    mobile_number: string;

    @Column({ nullable: true })
    gender?: string;

    @Column({ nullable: true })
    date_of_birth?: string;

    @Column({ nullable: true })
    profile_image?: string;

    @Column({ default: null })
    relationship: string;

    @Column()
    school_id?: number;

    @Column({ nullable: true })
    parent_user_id: number;

    @Column()
    role_id: number;

    @Column({ nullable: true })
    no_of_student?: number;

    @Column({ nullable: true })
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
    deleted_at: Date;

    @ManyToMany(() => Student, (student) => student.parents)
    students: Student[];

    @ManyToOne(() => Institute, (institute) => institute.parents)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => User, (user) => user.parents)
    @JoinColumn({ name: "parent_user_id" })
    user: User;

    @ManyToOne(() => Role, (role) => role.parents)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @ManyToOne(() => User, (user) => user.createdParents)
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedParents)
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedParents)
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}
