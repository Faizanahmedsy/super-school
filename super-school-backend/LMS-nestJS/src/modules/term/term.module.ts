import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TermService } from "./term.service";
import { TermController } from "./term.controller";
import { Term } from "./term.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { BatchService } from "../batch/batch.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TeacherService } from "../teacher/teacher.service";
import { TeacherModule } from "../teacher/teacher.module";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Term, DivisionSubject]),
        forwardRef(() => AuthModule),
        AuditLogModule,
        forwardRef(() => BatchModule),
        forwardRef(() => TeacherModule),
    ],
    controllers: [TermController],
    providers: [TermService, JwtService, BatchService],
    exports: [TermService, TypeOrmModule],
})
export class TermModule {}
