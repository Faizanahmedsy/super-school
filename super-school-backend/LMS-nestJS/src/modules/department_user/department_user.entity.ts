import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, DeleteDateColumn } from "typeorm";
import { User } from "../users/user.entity";

import { City } from "../city/city.entity";
import { State } from "../state/state.entity";
import { Role } from "../role/role.entity";

@Entity("department_user")
export class Department_USER {
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

    @Column({ nullable: true })
    profile_image: string;

    @Column()
    job_title: string;

    @Column()
    district_id: number;

    @Column()
    province_id: number;

    @Column()
    role_id: number;

    @Column({ nullable: true })
    department_user_id: number;

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

    @ManyToOne(() => User, (user) => user.createdDepartment, { nullable: false })
    @JoinColumn({ name: "created_by" })
    createdByUser: User;

    @ManyToOne(() => User, (user) => user.updatedDepartment, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updatedByUser: User;

    @ManyToOne(() => User, (user) => user.deletedDepartment, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deletedByUser: User;

    @ManyToOne(() => City, (city) => city.department)
    @JoinColumn({ name: "district_id" })
    city: City;

    @ManyToOne(() => State, (state) => state.department)
    @JoinColumn({ name: "province_id" })
    state: State;

    @ManyToOne(() => Role, (role) => role.department)
    @JoinColumn({ name: "role_id" })
    role: Role;
}
