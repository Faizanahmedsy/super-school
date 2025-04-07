import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, DeleteDateColumn } from "typeorm";
import { Permission } from "../permissions/permissions.entity";
import { ROLE } from "helper/constants";
import { User } from "../users/user.entity";
import { Student } from "../student/student.entity";
import { Parent } from "../parents/parents.entity";
import { AuditLog } from "../audit_log/audit-log.entity";
import { Department_USER } from "../department_user/department_user.entity";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ name: "role_name", enum: ROLE, nullable: false })
    role_name: string;

    @Column({ name: "role_name_show", default: "" })
    role_name_show: string;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    deleted_at: Date;

    @OneToMany(() => User, (user) => user.role)
    users: User[];

    @OneToMany(() => Permission, (permission) => permission.module)
    permissions: Permission[];

    @OneToMany(() => Student, (student) => student.role)
    students: Student[];

    @OneToMany(() => Parent, (parent) => parent.role)
    parents: Parent[];

    @OneToMany(() => AuditLog, (auditLog) => auditLog.role)
    auditlog: AuditLog[];

    @OneToMany(() => Department_USER, (department) => department.role)
    department: Department_USER[];
}
