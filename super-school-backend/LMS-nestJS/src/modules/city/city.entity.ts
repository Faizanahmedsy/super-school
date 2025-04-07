import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Timestamp,
    DeleteDateColumn,
} from "typeorm";
import { State } from "../state/state.entity";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { Department_USER } from "../department_user/department_user.entity";
import { Admin } from "../admin/admin.entity";

@Entity("districts")
export class City {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ length: 255 })
    district_name: string;

    @Column()
    province_id: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Timestamp;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Timestamp;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at: Timestamp;

    @ManyToOne(() => State, (state) => state.cities)
    @JoinColumn({ name: "province_id" })
    state: State;

    @OneToMany(() => Institute, (institute) => institute.city)
    institute: Institute[];

    @OneToMany(() => Department_USER, (department) => department.city)
    department: Department_USER[];

}
