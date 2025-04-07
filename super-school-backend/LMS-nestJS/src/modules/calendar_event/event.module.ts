import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { Event } from "./event.entity";
import { SocketGateway } from "./event.gateway";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { Division } from "../division/division.entity";
import { DivisionModule } from "../division/divison.module";
import { NotificationModule } from "../notification/notification.module";
import { Grade } from "../grade/grade.entity";
import { GradeModule } from "../grade/grade.module";
import { NotificationService } from "../notification/notification.service";
import { UsersModule } from "../users/user.module";
import { DivisionService } from "../division/division.service";
import { InstituteModule } from "../institutes/institutes.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { Student } from "../student/student.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Teacher } from "../teacher/teacher.entity";
import { ModuleModule } from "../module/module.module";
import { StudentModule } from "../student/student.module";
import { TeacherModule } from "../teacher/teacher.module";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { AdminModule } from "../admin/admin.module";
import { TimeTable } from "../time_table/time_table.entity";
@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Division, Grade, Student, DivisionSubject, Teacher, TimeTable]),
        forwardRef(() => GradeModule),
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
        forwardRef(() => DivisionModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => ModuleModule),
        forwardRef(() => StudentModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => AdminModule),
        AuditLogModule,
    ],
    providers: [SocketGateway, EventService, JwtService, DivisionService],
    controllers: [EventController],
    exports: [SocketGateway, EventService, TypeOrmModule],
})
export class EventModule {}
