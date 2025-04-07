import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OldQuestionPaper } from "./oldPaper.entity";
import { OldQuestionPaperService } from "./oldPaper.service";
import { OldQuestionPaperController } from "./oldPaper.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { GradeModule } from "../grade/grade.module";
import { BatchModule } from "../batch/batch.module";
import { AuditLogModule } from "../audit_log/audit-log.module";

@Module({
    imports: [TypeOrmModule.forFeature([OldQuestionPaper]), AuthModule, GradeModule, BatchModule,AuditLogModule],
    controllers: [OldQuestionPaperController],
    providers: [OldQuestionPaperService, JwtService],
    exports: [OldQuestionPaperService, TypeOrmModule],
})
export class OldQuestionPaperModule {}
