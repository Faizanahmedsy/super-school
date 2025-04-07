import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { PermissionsModule } from "../permissions/permissions.module";
import { ModuleModule } from "../module/module.module"; 
import { UsersModule } from "../users/user.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Role]),
        forwardRef(() => AuthModule),
        forwardRef(() => ModuleModule), 
        forwardRef(() => PermissionsModule),
        forwardRef(() => UsersModule),
        forwardRef(() => NotificationModule),
    ],
    providers: [RoleService, JwtService],
    controllers: [RoleController],
    exports: [RoleService,TypeOrmModule],
})
export class RoleModule {}
