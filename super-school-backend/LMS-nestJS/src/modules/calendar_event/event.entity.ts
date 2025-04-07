import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, OneToMany } from "typeorm";
import { Division } from "../division/division.entity";
import { Notification } from "../notification/notification.entity";
import { Institute } from "../institutes/institutes.entity";
import { Grade } from "../grade/grade.entity";
import { EVENT_TYPE } from "helper/constants";
@Entity("calendar_event")
export class Event {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ nullable: true })
    school_id: number;

    @Column()
    event_name: string;

    @Column({ name: "type", enum: EVENT_TYPE, nullable: false })
    type: string;

    @Column({ default: null })
    description: string;

    @Column({ nullable: true })
    grade_id: number;

    @Column({ default: null, nullable: true })
    class_id: number;

    @Column()
    start_date: string;

    @Column()
    end_date: string;

    @Column()
    start_time: string;

    @Column()
    end_time: string;

    // @Column({ default: false })
    // show_to_all: boolean;

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
    deleted_at?: Date;

    @ManyToOne(() => Grade, (grade) => grade.events)
    @JoinColumn({ name: "grade_id" })
    grade: Grade;

    @OneToMany(() => Notification, (notification) => notification.event)
    notification: Notification[];

    @ManyToOne(() => Institute, (institute) => institute.events)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => Division, (division) => division.events)
    @JoinColumn({ name: "class_id" })
    division: Division;
}

// DO $$
// BEGIN
//     CREATE TYPE event_type AS ENUM ('school', 'class', 'division');
// EXCEPTION
//     WHEN duplicate_object THEN NULL;
// END $$;

// ALTER TABLE calendar_event
// ADD COLUMN type event_type NOT NULL DEFAULT 'school';
