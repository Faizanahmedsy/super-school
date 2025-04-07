import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppConfigService } from "src/config/app/config.service";
import { UsersService } from "../users/user.service";
import { PermissionsModule } from "../permissions/permissions.module";
import { TeacherModule } from "../teacher/teacher.module";
import { RoleModule } from "../role/role.module";
import { ParentModule } from "../parents/parents.module";
import { StudentModule } from "../student/student.module";
import { AdminModule } from "../admin/admin.module";
import { InstituteModule } from "../institutes/institutes.module";
import { EmailService } from "src/services/mail.service";
import { NotificationModule } from "../notification/notification.module";
import { BatchModule } from "../batch/batch.module";
import { TermModule } from "../term/term.module";
import { DepartmentUserModule } from "../department_user/department_user.module";
import { OBSFileService } from "src/services/obs-file.service";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => PermissionsModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => ParentModule),
        forwardRef(() => StudentModule),
        forwardRef(() => AdminModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => BatchModule),
        forwardRef(() => TermModule),
        PassportModule,
        forwardRef(() => RoleModule),
        forwardRef(() => DepartmentUserModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: "30d" },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, EmailService, OBSFileService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
