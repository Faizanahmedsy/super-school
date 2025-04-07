import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Batch } from "./batch.entity";
import { BatchService } from "./batch.service";
import { BatchController } from "./batch.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { TermModule } from "../term/term.module";
import { InstituteModule } from "../institutes/institutes.module";
import { GradeModule } from "../grade/grade.module";
import { DivisionModule } from "../division/divison.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { SubjectModule } from "../subject/subject.module";
import { TermService } from "../term/term.service";
import { TeacherService } from "../teacher/teacher.service";
import { InstituteService } from "../institutes/institutes.service";
import { GradeService } from "../grade/grade.service";
import { DivisionService } from "../division/division.service";
import { TeacherModule } from "../teacher/teacher.module";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { SubjectService } from "../subject/subject.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { UsersModule } from "../users/user.module";
import { StudyMaterialModule } from "../study_materials/study_materials.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Batch]),
        AuditLogModule,
        // AuthModule,
        forwardRef(() => AuthModule),
        forwardRef(() => TermModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => GradeModule),
        forwardRef(() => DivisionModule),
        forwardRef(() => TeacherModule),
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => UsersModule),
        forwardRef(() => StudyMaterialModule),

        SubjectModule,
    ],
    providers: [BatchService, TermService, GradeService, DivisionService, JwtService],
    controllers: [BatchController],
    exports: [BatchService, TypeOrmModule],
})
export class BatchModule {}
