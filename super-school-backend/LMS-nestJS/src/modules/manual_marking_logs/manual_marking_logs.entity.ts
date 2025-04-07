import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DigitalMarking } from "../digital_markings/digital_markings.entity";
import { Institute } from "../institutes/institutes.entity";
import { User } from "../users/user.entity";

@Entity("manual_marking_logs")
export class ManualMarkingLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DigitalMarking, (digitalMarking) => digitalMarking.manualMarkingLogs, {
        onDelete: "NO ACTION",
        eager: true,
    })
    @JoinColumn({ name: "digital_marking_id" })
    digital_marking_id: DigitalMarking;

    @ManyToOne(() => Institute, (school) => school.manualMarkingLogsSchool, {
        onDelete: "CASCADE",
        eager: true,
    })
    @JoinColumn({ name: "school_id" })
    school_id: Institute;

    @Column("jsonb")
    before: Record<string, any>;

    @Column("jsonb")
    after: Record<string, any>;

    @ManyToOne(() => User, (user) => user.manualMarkingLogsDoneBy, {
        onDelete: "NO ACTION",
        eager: true,
    })
    @JoinColumn({ name: "done_by_id" })
    done_by_id: User;

    @CreateDateColumn({ type: "timestamp" })
    done_at: Date;
}
