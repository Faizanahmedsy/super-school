import { Controller, Get, Req, Res, UseGuards, Logger, Post, Body } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("Dashboard")
@Controller("dashboard")
export class DashboardController {
    private readonly logger = new Logger(DashboardController.name);

    constructor(private readonly dashboardService: DashboardService) {}

    @UseGuards(JwtAuthGuard)
    @Get("/totals")
    async getTotals(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        const userRole = req.user.role_name;
        const instituteId = req.user.institute_id;
        const userId = req.user.userId;

        try {
            const response = {};

            if (userRole === ROLE.MASTER_ADMIN) {
                response["totalStudents"] = await this.dashboardService.getTotalStudents();
                response["totalTeachers"] = await this.dashboardService.getTotalTeachers();
                response["totalInstitutes"] = await this.dashboardService.getTotalInstitutes();
            } else if (userRole === ROLE.SUB_ADMIN) {
                if (!instituteId) {
                    this.logger.error("Institute ID is required but not found.");
                    return commonResponse.error(languageCode, res, "INSTITUTE_ID_REQUIRED", 400, {});
                }
                response["totalStudents"] = await this.dashboardService.getTotalStudentsByInstitute(instituteId);
                response["totalTeachers"] = await this.dashboardService.getTotalTeachersByInstitute(instituteId);
                response["totalInstitutes"] = null;
            } else if (userRole === ROLE.TEACHER) {
                if (!instituteId) {
                    this.logger.error("Institute ID is required but not found for Teacher.");
                    return commonResponse.error(languageCode, res, "INSTITUTE_ID_REQUIRED", 400, {});
                }

                response["totalStudents"] = await this.dashboardService.getTotalStudentsByInstitute(instituteId);
                response["totalInstitutes"] = null;
                response["totalTeachers"] = null;
            } else if (userRole === ROLE.PARENTS) {
                if (!userId) {
                    this.logger.error("User ID is required but not found for Parent.");
                    return commonResponse.error(languageCode, res, "USER_ID_REQUIRED", 400, {});
                }

                response["totalStudents"] = await this.dashboardService.getTotalStudentsByParent(userId);
                response["totalInstitutes"] = null;
                response["totalTeachers"] = null;
            } else if (userRole === ROLE.STUDENT) {
                response["totalStudents"] = null;
                response["totalInstitutes"] = null;
                response["totalTeachers"] = null;
            }
            console.log("responseresponseresponseresponse", response);
            return commonResponse.success(languageCode, res, "TOTALS", 200, response);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
