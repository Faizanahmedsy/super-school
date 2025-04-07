import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InstituteController } from "./institutes.controller";
import { InstituteService } from "./institutes.service";
import { Institute } from "./institutes.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { GradeModule } from "../grade/grade.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { AdminModule } from "../admin/admin.module";
import { Admin } from "../admin/admin.entity";
import { GeneralSetting } from "../general_setting/general-setting.entity";
import { TeacherModule } from "../teacher/teacher.module";
import { StudentModule } from "../student/student.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([Institute, Admin, GeneralSetting]),
        forwardRef(() => AuthModule),
        AuditLogModule,
        forwardRef(() => BatchModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => StudentModule),
    ],
    controllers: [InstituteController],
    providers: [InstituteService, JwtService],
    exports: [InstituteService, TypeOrmModule],
})
export class InstituteModule {}
