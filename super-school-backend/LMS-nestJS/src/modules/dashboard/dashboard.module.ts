import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "../student/student.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Institute } from "../institutes/institutes.entity";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([Student, Teacher, Institute]), AuthModule],
    controllers: [DashboardController],
    providers: [DashboardService, JwtService],
})
export class DashboardModule {}
