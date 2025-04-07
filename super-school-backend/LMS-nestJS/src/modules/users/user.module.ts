import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersService } from "./user.service";
import { UsersController } from "./user.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { TeacherModule } from "../teacher/teacher.module";
import { ParentModule } from "../parents/parents.module";
import { GradeModule } from "../grade/grade.module";
// import { S3Service } from "src/services/s3.service";
import { JwtModule } from "@nestjs/jwt";
// import { AwsModule } from "src/services/aws.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "../auth/jwt.strategy";
import { EmailService } from "src/services/mail.service";
import { UploadModule } from "../upload/upload.module";
import { NotificationService } from "../notification/notification.service";
import { NotificationModule } from "../notification/notification.module";
import { EventModule } from "../calendar_event/event.module";
import { InstituteService } from "../institutes/institutes.service";
import { InstituteModule } from "../institutes/institutes.module";
import { RoleModule } from "../role/role.module";
import { AdminModule } from "../admin/admin.module";
import { GeneralSettingModule } from "../general_setting/general-setting.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => AuthModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => ParentModule),
        forwardRef(() => AdminModule),
        forwardRef(() => GeneralSettingModule),
        // AwsModule,
        RoleModule,
        UploadModule,
        forwardRef(() => InstituteModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => EventModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: "30d" }, // Set expiration to 30 days
            }),
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService, JwtStrategy, EmailService, InstituteService],
    exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
