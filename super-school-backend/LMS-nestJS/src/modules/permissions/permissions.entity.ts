import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn, Timestamp } from "typeorm";
import { Module } from "../module/module.entity";
import { Role } from "../role/role.entity";
import { Institute } from "../institutes/institutes.entity";
import { User } from "../users/user.entity";

@Entity("permissions")
export class Permission {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    role_id: number;

    @Column()
    module_id: number;

    @Column("jsonb")
    allow: {
        add: boolean;
        edit: boolean;
        delete: boolean;
        view: boolean;
    };

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Timestamp;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Timestamp;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at?: Timestamp;

    @ManyToOne(() => Module, (module) => module.permissions)
    @JoinColumn({ name: "module_id" })
    module: Module;

    @ManyToOne(() => Role, (role) => role.permissions)
    @JoinColumn({ name: "role_id" })
    role: Role;

    // @ManyToOne(() => Institute, (institute) => institute.permissions)
    // @JoinColumn({ name: "school_id" })
    // institute: Institute;

    @ManyToOne(() => User, (user) => user.createdPermissions, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedPermissions, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedPermissions, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}
