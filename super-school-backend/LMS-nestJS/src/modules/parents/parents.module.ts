import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Parent } from "./parents.entity";
import { ParentService } from "./parents.service";
import { ParentController } from "./parents.controller";
import { UsersModule } from "../users/user.module";
import { RoleModule } from "../role/role.module";
import { InstituteModule } from "../institutes/institutes.module";
import { StudentModule } from "../student/student.module";
import { AuthModule } from "../auth/auth.module";
import { UploadService } from "../upload/upload.service";
import { NotificationModule } from "../notification/notification.module";
import { SocketGateway } from "../calendar_event/event.gateway";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { StudentService } from "../student/student.service";
import { ModuleModule } from "../module/module.module";
import { OBSFileService } from "src/services/obs-file.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => RoleModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => StudentModule),
        forwardRef(() => AuthModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => ModuleModule),
        AuditLogModule,
        TypeOrmModule.forFeature([Parent]),
    ],
    providers: [ParentService, UploadService, SocketGateway, OBSFileService, JwtService],
    controllers: [ParentController],
    exports: [ParentService, TypeOrmModule],
})
export class ParentModule {}
