import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Grade } from "./grade.entity";
import { GradeService } from "./grade.service";
import { GradeController } from "./grade.controller";
import { UsersModule } from "../users/user.module";
import { RoleModule } from "../role/role.module";
import { InstituteModule } from "../institutes/institutes.module";

import { DivisionModule } from "../division/divison.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { TeacherModule } from "../teacher/teacher.module";
import { SubjectModule } from "../subject/subject.module";
import { TimeTableModule } from "../time_table/time_table.module";
import { EventModule } from "../calendar_event/event.module";
@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => DivisionModule),
        forwardRef(() => BatchModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => SubjectModule),
        forwardRef(() => TimeTableModule),
        forwardRef(() => EventModule),
        TypeOrmModule.forFeature([Grade, DivisionSubject]),
        AuditLogModule,
    ],
    providers: [GradeService],
    controllers: [GradeController],
    exports: [TypeOrmModule, GradeService],
})
export class GradeModule {}
