import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/user.module";
import { InstituteModule } from "../institutes/institutes.module";
import { SocketGateway } from "../calendar_event/event.gateway";
import { EventModule } from "../calendar_event/event.module";
import { UsersService } from "../users/user.service";

import { ParentModule } from "../parents/parents.module";
import { RoleModule } from "../role/role.module";
import { ModuleModule } from "../module/module.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        forwardRef(() => UsersModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => AuthModule),
        forwardRef(() => EventModule),
        forwardRef(() => ParentModule),
        forwardRef(() => RoleModule),
        forwardRef(() => ModuleModule),
    ],
    controllers: [NotificationController],
    providers: [NotificationService, JwtService, SocketGateway],
    exports: [NotificationService, TypeOrmModule],
})
export class NotificationModule {}
