import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, Timestamp } from "typeorm";
import { City } from "../city/city.entity";
import { Institute } from "../institutes/institutes.entity";
import { Department_USER } from "../department_user/department_user.entity";

@Entity("provinces")
export class State {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ type: "varchar", length: 255 })
    province_name: string;

    @Column({ type: "varchar", length: 255 })
    country: string;

    @CreateDateColumn({ type: "timestamptz", precision: 6, name: "created_at" })
    created_at: Timestamp;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, name: "updated_at" })
    updated_at: Timestamp;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, name: "deleted_at" })
    deleted_at: Timestamp;

    @OneToMany(() => City, (city) => city.state)
    cities: City[];

    @OneToMany(() => Institute, (institute) => institute.state)
    institute: Institute[];

    @OneToMany(() => Department_USER, (department) => department.state)
    department: Department_USER[];
}
