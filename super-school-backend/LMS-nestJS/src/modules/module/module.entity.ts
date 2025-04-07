import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    DeleteDateColumn,
    Timestamp,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Permission } from "../permissions/permissions.entity";
import { User } from "../users/user.entity";
import { Notification } from "../notification/notification.entity";

@Entity("modules")
export class Module {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ name: "module_name", type: "varchar", length: 255, nullable: false })
    module_name: string;

    @Column({ default: null })
    module_name_show: string;

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
    deleted_at?: Date | null;

    @OneToMany(() => Permission, (permission) => permission.module)
    permissions: Permission[];

    @OneToMany(() => Notification, (notification) => notification.module)
    notification: Notification[];

    @ManyToOne(() => User, (user) => user.createdModule, { nullable: false })
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedModule, { nullable: true })
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedModule, { nullable: true })
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}
