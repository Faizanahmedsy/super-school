import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "./student.entity";
import { StudentService } from "./student.service";
import { StudentController } from "./student.controller";
import { UsersModule } from "../users/user.module";
import { RoleModule } from "../role/role.module";
import { InstituteModule } from "../institutes/institutes.module";
import { ParentModule } from "../parents/parents.module";
import { AuthModule } from "../auth/auth.module";
import { UploadService } from "../upload/upload.service";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { SocketGateway } from "../calendar_event/event.gateway";
import { NotificationModule } from "../notification/notification.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { ParentService } from "../parents/parents.service";
import { NotificationService } from "../notification/notification.service";
import { ModuleModule } from "../module/module.module";
import { AdminModule } from "../admin/admin.module";
import { OBSFileService } from "src/services/obs-file.service";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => RoleModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => ParentModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => AuthModule),
        forwardRef(() => ModuleModule),
        forwardRef(() => AdminModule),
        AuditLogModule,
        TypeOrmModule.forFeature([Student]),
    ],
    providers: [StudentService, UploadService, SocketGateway, ParentService, OBSFileService],
    controllers: [StudentController],
    exports: [StudentService],
})
export class StudentModule {}
