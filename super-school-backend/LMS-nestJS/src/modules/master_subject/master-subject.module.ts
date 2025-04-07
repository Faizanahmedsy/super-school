import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MasterSubjectService } from "./master-subject.service";
import { MasterSubjectController } from "./master-subject.controller";
import { MasterSubject } from "./master-subject.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { UploadService } from "../upload/upload.service";
import { TeacherModule } from "../teacher/teacher.module";

@Module({
    imports: [TypeOrmModule.forFeature([MasterSubject]), forwardRef(() => AuthModule), forwardRef(() => AuditLogModule), forwardRef(() => TeacherModule)],
    controllers: [MasterSubjectController],
    providers: [MasterSubjectService, JwtService, UploadService],
    exports: [MasterSubjectService],
})
export class MasterSubjectModule {}
