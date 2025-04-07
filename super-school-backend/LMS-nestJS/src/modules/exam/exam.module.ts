import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exam } from "./exam.entity";
import { ExamService } from "./exam.service";
import { ExamController } from "./exam.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Exam])],
    providers: [ExamService],
    controllers: [ExamController],
})
export class ExamModule {}
