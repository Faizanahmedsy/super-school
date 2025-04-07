import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentAnswerSheet } from "./student_answer_sheet.entity";
import { Student } from "../student/student.entity";
import { AssessmentSubject } from "../assessment_subjects/assessment_subjects.entity";
import { Institute } from "../institutes/institutes.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { Grade } from "../grade/grade.entity";
import { Division } from "../division/division.entity";
import { User } from "../users/user.entity";
import { StudentAnswerSheetService } from "./student_answer_sheet.service";
import { StudentAnswerSheetController } from "./student_answer_sheet.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([StudentAnswerSheet, Student, AssessmentSubject, Institute, Batch, Term, Grade, Division, User, AuthModule])],
    providers: [StudentAnswerSheetService, JwtService],
    controllers: [StudentAnswerSheetController],
    exports: [StudentAnswerSheetService],
})
export class StudentAnswerSheetModule {}
