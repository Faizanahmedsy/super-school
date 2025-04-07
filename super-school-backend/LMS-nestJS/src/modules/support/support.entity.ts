import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
@Entity("support")
export class Support {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ nullable: false })
    description: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    role_name: string;

    @Column("json")
    attachment: string[];

    @Column()
    user_id: number;

    @Column()
    school_id: number;

    @ManyToOne(() => Institute, (institute) => institute.support)
    @JoinColumn({ name: "school_id" })
    institute: Institute;

    @ManyToOne(() => User, (user) => user.contactUser, { nullable: false })
    @JoinColumn({ name: "user_id" })
    creator: User;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: false })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;

    @DeleteDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    deleted_at?: Date;
}
