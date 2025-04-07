import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionsService } from "./permissions.service";

import { Permission } from "../permissions/permissions.entity";
import { PermissionController } from "./permissions.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { AuditLogModule } from "../audit_log/audit-log.module";

@Module({
    imports: [TypeOrmModule.forFeature([Permission]), forwardRef(() => AuthModule),AuditLogModule],
    controllers: [PermissionController],
    providers: [PermissionsService, JwtService],
    exports: [PermissionsService],
})
export class PermissionsModule {}
