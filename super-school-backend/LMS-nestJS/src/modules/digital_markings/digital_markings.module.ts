import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DigitalMarking } from "./digital_markings.entity";
import { StudentAnswerSheet } from "../student_answer_sheet/student_answer_sheet.entity";
import { Batch } from "../batch/batch.entity";
import { Term } from "../term/term.entity";
import { User } from "../users/user.entity";
import { Institute } from "../institutes/institutes.entity";
import { DigitalMarkingService } from "./digital_markings.service";
import { DigitalMarkingController } from "./digital_markings.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([DigitalMarking, StudentAnswerSheet, Institute, Batch, Term, User,AuthModule])],
    providers: [DigitalMarkingService,JwtService],
    controllers: [DigitalMarkingController],
    exports: [DigitalMarkingService],
})
export class DigitalMarkingsModule {}
