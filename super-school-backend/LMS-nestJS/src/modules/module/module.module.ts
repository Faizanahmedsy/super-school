import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModuleController } from "./module.controller";
import { ModuleService } from "./module.service";
import { Module as ModuleEntity } from "./module.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../role/role.entity";
import { Permission } from "../permissions/permissions.entity";
import { RoleModule } from "../role/role.module";
import { PermissionsModule } from "../permissions/permissions.module";
import { RoleService } from "../role/role.service";
import { UsersService } from "../users/user.service";
import { UsersModule } from "../users/user.module";
import { AuditLogModule } from "../audit_log/audit-log.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ModuleEntity, Role, Permission]),
        forwardRef(() => RoleModule),
        forwardRef(() => PermissionsModule),
        forwardRef(() => UsersModule),
        AuditLogModule
    ],
    controllers: [ModuleController],
    providers: [ModuleService, RoleService, JwtService],
    exports: [ModuleService],
})
export class ModuleModule {}
