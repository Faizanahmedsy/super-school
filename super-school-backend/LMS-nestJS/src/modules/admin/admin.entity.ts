import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, DeleteDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Role } from "../role/role.entity";
import { City } from "../city/city.entity";
import { State } from "../state/state.entity";

@Entity("school_admins")
export class Admin {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    mobile_number: string;

    @Column({ nullable: true, length: 255 })
    gender: string;

    @Column({ nullable: true })
    date_of_birth: string;

    @Column({ nullable: true })
    profile_image: string;

    @Column()
    school_admin_user_id: number;

    @Column()
    role_id: number;

    @Column()
    school_id: number;

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
    deleted_at: Date;

    @ManyToOne(() => Institute, (institute) => institute.admins)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @OneToMany(() => User, (user) => user)
    @JoinColumn({ name: "school_admin_user_id" })
    users: User[];

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @ManyToOne(() => User, (user) => user.createdAdmins, { nullable: false })
    @JoinColumn({ name: "created_by" })
    createdByUser: User;

    @ManyToOne(() => User, (user) => user.updatedAdmins, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updatedByUser: User;

    @ManyToOne(() => User, (user) => user.deletedAdmins, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deletedByUser: User;
}
