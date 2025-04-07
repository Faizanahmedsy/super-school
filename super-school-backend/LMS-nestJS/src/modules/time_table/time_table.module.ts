import { forwardRef, Module } from "@nestjs/common";
import { TimeTableController } from "./time_table.controller";
import { TimeTableService } from "./time_table.service";
import { TimeTable } from "./time_table.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BatchModule } from "../batch/batch.module";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { AuthModule } from "../auth/auth.module";
import { TeacherModule } from "../teacher/teacher.module";
import { JwtService } from "@nestjs/jwt";
import { GradeModule } from "../grade/grade.module";
import { DivisionModule } from "../division/divison.module";
import { StudentModule } from "../student/student.module";
import { ModuleModule } from "../module/module.module";
import { SocketGateway } from "../calendar_event/event.gateway";
import { NotificationModule } from "../notification/notification.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([TimeTable]),
        forwardRef(() => BatchModule),
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => AuthModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => GradeModule),
        forwardRef(() => DivisionModule),
        forwardRef(() => StudentModule),
        forwardRef(() => ModuleModule),
        forwardRef(() => NotificationModule),
    ],
    controllers: [TimeTableController],
    providers: [TimeTableService, JwtService, SocketGateway],
    exports: [TimeTableService],
})
export class TimeTableModule {}
