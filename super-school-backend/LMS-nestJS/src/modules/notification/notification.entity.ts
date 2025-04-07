import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    DeleteDateColumn,
    UsingJoinColumnIsNotAllowedError,
    JoinColumn,
} from "typeorm";
import { Institute } from "../institutes/institutes.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";
import { Event } from "../calendar_event/event.entity";
import { User } from "../users/user.entity";
import { Module } from "../module/module.entity";
@Entity("notifications")
export class Notification {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text" })
    message: string;

    @Column({ nullable: false })
    to_user_id: number;

    @Column({ default: false })
    is_read: boolean;

    @Column()
    school_id: number;

    @Column({ nullable: true })
    grade_id: number;

    @Column({ nullable: true })
    grade_class_id: number;

    @Column({ nullable: true })
    event_id: number;

    @Column()
    module_id: number;

    @Column()
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ nullable: true })
    deleted_by?: number;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at: Date;

    @Column({ default: false })
    show_to_all: boolean;

    @Column({ type: "int", default: 0 })
    recipient_count: number;

    @ManyToOne(() => Institute, (institute) => institute.notification)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => Grade, (grade) => grade.notification)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @ManyToOne(() => Division, (division) => division.notification)
    @JoinColumn({ name: "grade_class_id" })
    division: Division;

    @ManyToOne(() => Event, (event) => event.notification)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @ManyToOne(() => User, (user) => user.notifications_to_user)
    @JoinColumn({ name: "to_user_id" })
    to_user: User;

    @ManyToOne(() => Module, (module) => module.notification)
    @JoinColumn({ name: "module_id" })
    module: Module;

    @ManyToOne(() => User, (user) => user.createdNotification)
    @JoinColumn({ name: "created_by" })
    creator: User;

    @ManyToOne(() => User, (user) => user.updatedNotification)
    @JoinColumn({ name: "updated_by" })
    updater: User;

    @ManyToOne(() => User, (user) => user.deletedNotification)
    @JoinColumn({ name: "deleted_by" })
    deleter: User;
}

// ALTER TABLE public.notifications ADD to_user int4 NULL;
// ALTER TABLE public.notifications ADD class_id int4 NULL;
// ALTER TABLE public.notifications ADD division_id int4 NULL;
// ALTER TABLE public.notifications ADD event_id int4 NULL;
// ALTER TABLE public.notifications ADD deleted_by int8 NULL;
// ALTER TABLE public.notifications ADD deleted_at timestamptz NULL;
// ALTER TABLE public.notifications ADD show_to_all boolean DEFAULT false NULL;
// ALTER TABLE public.notifications DROP COLUMN recipientcount;
// ALTER TABLE public.notifications ADD recipientcount int4 DEFAULT 0 NOT NULL;
