import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssessmentSubjectController } from "./assessment_subjects.controller";
import { AssessmentSubjectService } from "./assessment_subjects.service";
import { AssessmentSubject } from "./assessment_subjects.entity";
import { Assessment } from "../assessment/assessment.entity";
import { Subject } from "../subject/subject.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";
import { Institute } from "../institutes/institutes.entity";
import { Student } from "../student/student.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { User } from "../users/user.entity";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([AssessmentSubject, Assessment, Subject, Grade, Division, Institute, Student, Batch, Term, User, AuthModule])],
    controllers: [AssessmentSubjectController],
    providers: [AssessmentSubjectService, JwtService],
    exports: [AssessmentSubjectService],
})
export class AssessmentSubjectModule {}
