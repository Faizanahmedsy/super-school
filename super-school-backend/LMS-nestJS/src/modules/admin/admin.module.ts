import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "./admin.entity";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { UsersModule } from "../users/user.module";
import { RoleModule } from "../role/role.module";
import { InstituteModule } from "../institutes/institutes.module";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { UploadService } from "../upload/upload.service";
import { SocketGateway } from "../calendar_event/event.gateway";
import { NotificationModule } from "../notification/notification.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { ModuleModule } from "../module/module.module";
import { OBSFileService } from "src/services/obs-file.service";
@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => RoleModule),
        forwardRef(() => InstituteModule),
        TypeOrmModule.forFeature([Admin]),
        forwardRef(() => AuthModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => ModuleModule),
        AuditLogModule,
    ],
    providers: [AdminService, JwtService, UploadService, SocketGateway, OBSFileService],
    controllers: [AdminController],
    exports: [AdminService],
})
export class AdminModule {}
