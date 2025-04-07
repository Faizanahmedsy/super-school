import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DivisionSubjectController } from "../division_subject/divisionsubject.controller";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";

import { Subject } from "../subject/subject.entity";
import { SubjectModule } from "../subject/subject.module";
import { JwtService } from "@nestjs/jwt";
import { TeacherModule } from "../teacher/teacher.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { StudentModule } from "../student/student.module";
import { TermModule } from "../term/term.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([DivisionSubject]),
        forwardRef(() => SubjectModule), // Subject Model Import
        forwardRef(() => TeacherModule), // Teachers Model Import
        forwardRef(() => BatchModule),
        forwardRef(() => StudentModule),
        forwardRef(() => TermModule),
        AuditLogModule,
    ],
    controllers: [DivisionSubjectController],
    providers: [DivisionSubjectService, JwtService],
    exports: [DivisionSubjectService],
})
export class DivisionSubjectModule {}
