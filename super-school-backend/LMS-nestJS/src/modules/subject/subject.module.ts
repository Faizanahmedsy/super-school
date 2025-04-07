import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubjectService } from "./subject.service";
import { SubjectController } from "./subject.controller";
import { Subject } from "./subject.entity";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { GradeService } from "../grade/grade.service";
import { GradeModule } from "../grade/grade.module";
import { TermModule } from "../term/term.module";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { TeacherModule } from "../teacher/teacher.module";
import { TimeTableModule } from "../time_table/time_table.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([Subject]),
        AuditLogModule,
        forwardRef(() => GradeModule),
        TermModule,
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => TimeTableModule),
    ],
    controllers: [SubjectController],
    providers: [SubjectService],
    exports: [SubjectService],
})
export class SubjectModule {}
