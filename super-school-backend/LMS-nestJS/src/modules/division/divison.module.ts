import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Division } from "./division.entity";
import { DivisionService } from "./division.service";
import { DivisionController } from "./division.controller";
import { UsersModule } from "../users/user.module";
import { GradeModule } from "../grade/grade.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { TeacherModule } from "../teacher/teacher.module";
import { Student } from "../student/student.entity";
import { EventModule } from "../calendar_event/event.module";
import { TimeTableModule } from "../time_table/time_table.module";
@Module({
    imports: [
        forwardRef(() => UsersModule),
        TypeOrmModule.forFeature([Division, Student]),
        forwardRef(() => GradeModule),
        forwardRef(() => EventModule),
        forwardRef(() => TimeTableModule),
        AuditLogModule,
        forwardRef(() => TeacherModule),
    ],
    providers: [DivisionService],
    controllers: [DivisionController],
    exports: [TypeOrmModule, DivisionService],
})
export class DivisionModule {}
