import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubjectModule } from "../subject/subject.module";
import { JwtService } from "@nestjs/jwt";
import { TeacherModule } from "../teacher/teacher.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { StudentModule } from "../student/student.module";
import { StudyMaterialController } from "./study_materials.controller";
import { StudyMaterialService } from "./study_materials.service";
import { StudyMaterial } from "./study_materials.entity";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { Student } from "../student/student.entity";
import { UploadService } from "../upload/upload.service";
import { OBSFileService } from "src/services/obs-file.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([StudyMaterial, Student]),
        forwardRef(() => SubjectModule), // Subject Model Import
        forwardRef(() => TeacherModule), // Teachers Model Import
        forwardRef(() => BatchModule),
        forwardRef(() => StudentModule),
        forwardRef(() => DivisionSubjectModule),
        AuditLogModule,
    ],
    controllers: [StudyMaterialController],
    providers: [StudyMaterialService, JwtService, UploadService, OBSFileService],
    exports: [StudyMaterialService],
})
export class StudyMaterialModule {}
