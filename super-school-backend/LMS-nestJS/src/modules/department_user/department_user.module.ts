import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Department_USER } from "./department_user.entity";
import { DepartmentUserService } from "./department_user.service";
import { DepartmentUserController } from "./department_user.controller";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { UploadService } from "../upload/upload.service";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { RoleModule } from "../role/role.module";
import { UsersModule } from "../users/user.module";
import { OBSFileService } from "src/services/obs-file.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Department_USER]),
        forwardRef(() => AuthModule),
        forwardRef(() => AuditLogModule),
        forwardRef(() => RoleModule),
        forwardRef(() => UsersModule),
    ],
    providers: [DepartmentUserService, JwtService, UploadService, OBSFileService],
    controllers: [DepartmentUserController],
    exports: [DepartmentUserService],
})
export class DepartmentUserModule {}
