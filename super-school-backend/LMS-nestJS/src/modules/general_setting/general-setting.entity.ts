import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("general_setting")
export class GeneralSetting {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ nullable: true })
    theme_primary_color: string;

    @Column({ nullable: true })
    theme_secondary_color: string;

    @Column({ length: 255 })
    support_email: string;

    @CreateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", precision: 6, nullable: true })
    updated_at: Date;
}
