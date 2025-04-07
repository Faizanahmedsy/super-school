import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Role } from "../role/role.entity";
import { Institute } from "../institutes/institutes.entity";

@Entity("audit_log")
export class AuditLog {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ nullable: true })
    role_id: number;

    @Column()
    action: string;

    @Column()
    message: string;

    @Column("json", { nullable: true })
    old_data: any;

    @Column("json", { nullable: true })
    new_data: any;

    @Column({ nullable: true })
    action_user_id: number;

    @Column({ nullable: true })
    school_id: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Role, (role) => role.auditlog)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @ManyToOne(() => User, (user) => user.auditlog)
    @JoinColumn({ name: "action_user_id" })
    user: User;

    @ManyToOne(() => Institute, (institute) => institute.auditlog)
    @JoinColumn({ name: "school_id" })
    institute: Institute;
}
