import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubjectModule } from "../subject/subject.module";
import { JwtService } from "@nestjs/jwt";
import { TeacherModule } from "../teacher/teacher.module";
import { AuditLogModule } from "../audit_log/audit-log.module";
import { BatchModule } from "../batch/batch.module";
import { StudentModule } from "../student/student.module";
import { LessonPlanController } from "./lesson_plans.controller";
import { LessonPlanService } from "./lesson_plans.service";
import { LessonPlans } from "./lesson_plans.entity";
import { DivisionSubjectModule } from "../division_subject/divisionsubject.module";
import { Student } from "../student/student.entity";
import { MasterSubjectModule } from "../master_subject/master-subject.module";
import { UsersModule } from "../users/user.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([LessonPlans, Student]),
        forwardRef(() => SubjectModule), // Subject Model Import
        forwardRef(() => TeacherModule), // Teachers Model Import
        forwardRef(() => BatchModule),
        forwardRef(() => StudentModule),
        forwardRef(() => DivisionSubjectModule),
        forwardRef(() => MasterSubjectModule),
        forwardRef(() => UsersModule),
        AuditLogModule,
    ],
    controllers: [LessonPlanController],
    providers: [LessonPlanService, JwtService],
    exports: [LessonPlanService],
})
export class LessonPlanModule {}
