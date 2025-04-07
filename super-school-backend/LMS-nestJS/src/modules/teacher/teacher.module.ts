import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Teacher } from "./teacher.entity";
import { TeacherService } from "./teacher.service";
import { TeacherController } from "./teacher.controller";
import { UsersModule } from "../users/user.module";
import { RoleModule } from "../role/role.module"; // Check this import
import { InstituteModule } from "../institutes/institutes.module";
// import { S3Service } from "src/services/s3.service";
// import { AwsModule } from "src/services/aws.module";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { DivisionModule } from "../division/divison.module";
import { UploadService } from "../upload/upload.service";
import { SubjectModule } from "../subject/subject.module";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { NotificationModule } from "../notification/notification.module";
import { SocketGateway } from "../calendar_event/event.gateway";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { ModuleModule } from "../module/module.module";
import { AdminModule } from "../admin/admin.module";
import { OBSFileService } from "src/services/obs-file.service";
import { MasterSubjectModule } from "../master_subject/master-subject.module";
@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => RoleModule),
        forwardRef(() => MasterSubjectModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => DivisionModule),
        forwardRef(() => AuthModule),
        forwardRef(() => SubjectModule),
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => BatchModule),
        forwardRef(() => ModuleModule),
        forwardRef(() => AdminModule),
        TypeOrmModule.forFeature([Teacher]),
        AuditLogModule,
        // AwsModule,
    ],
    providers: [TeacherService, OBSFileService, JwtService, UploadService, SocketGateway],
    controllers: [TeacherController],
    exports: [TeacherService],
})
export class TeacherModule {}
