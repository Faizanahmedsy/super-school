import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, NotFoundException, Query } from "@nestjs/common";
import { TermService } from "./term.service";
import { CreateTermDto } from "../term/dtos/create-term.dto";
import { UpdateTermDto } from "../term/dtos/update-term.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TeacherService } from "../teacher/teacher.service";

@Controller("term")
@ApiBearerAuth()
@ApiTags("Term")
export class TermController {
    constructor(private termService: TermService, private readonly auditLogService: AuditLogService, private readonly teacherService: TeacherService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createTerm(@Body() createTermDto: CreateTermDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingTerm = await this.termService.findTermByName(createTermDto.term_name);
            if (existingTerm) {
                return commonResponse.error(languageCode, res, "TERM_ALREADY_EXISTS", 409, {});
            }

            const newTerm = await this.termService.createTerm(createTermDto);
            await this.auditLogService.create({
                action: "CREATE",
                message: `Term for ${newTerm.term_name} created.`,
                old_data: null,
                new_data: newTerm,
                action_user_id: req.user.userId,
                school_id: newTerm.school_id,
                role_id: req.user.role_id,
            });
            return commonResponse.success(languageCode, res, "TERM_CREATED", 201, newTerm);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "student_count", required: false, type: Boolean, example: true })
    async getTerms(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.role_name == "teacher") {
                let teacherId = await this.teacherService.getTeacherByObj({ teacher_user_id: req.user.userId });

                if (!teacherId) {
                    return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
                } else {
                    // console.log("🚀 ~ file: grade.controller.ts:159 ~ GradeController ~ getGrades ~ teacherId:", teacherId);
                    query["teacher_id"] = teacherId.id;
                }
            }
            console.log("🚀 ~ file: term.controller.ts:72 ~ TermController ~ getTerms ~ query:", query);
            const terms = await this.termService.getTerms(query);

            return commonResponse.success(languageCode, res, "TERM_LIST", 200, terms);
        } catch (error) {
            console.log("🚀 ~ file: term.controller.ts:76 ~ TermController ~ getTerms ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getTermById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const term = await this.termService.getTermById(id);
            return commonResponse.success(languageCode, res, "TERM_DETAILS", 200, term);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return commonResponse.error(languageCode, res, "TERM_NOT_FOUND", 404, {});
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    async updateTerm(@Param("id") id: number, @Body() updateTermDto: UpdateTermDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingTerm = await this.termService.getTermById(id);

            if (!existingTerm) {
                return commonResponse.error(languageCode, res, "TERM_NOT_FOUND", 404, {});
            }

            let oldBatch = { ...existingTerm };

            const updatedTerm = await this.termService.updateTerm(id, updateTermDto);

            if (updatedTerm) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Term for ${updatedTerm.term_name} updated.`,
                    old_data: oldBatch,
                    new_data: updatedTerm,
                    action_user_id: req.user.userId,
                    school_id: updatedTerm.school_id,
                    role_id: req.user.role_id,
                });
                return commonResponse.success(languageCode, res, "TERM_UPDATED_SUCCESS", 200, updatedTerm);
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    async deleteTerm(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingTerm = await this.termService.getTermById(id);

            if (!existingTerm) {
                return commonResponse.error(languageCode, res, "TERM_NOT_FOUND", 404, {});
            }

            let oldData = { ...existingTerm };

            await this.termService.deleteTerm(id);

            const deletedAt = new Date();

            const auditLogData = {
                action: "DELETE",
                message: `Term for ${existingTerm.term_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,
                school_id: existingTerm.school_id,

                deleted_at: deletedAt,
            };

            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "TERM_DELETED_SUCCESS", 200, {});
        } catch (error) {
            if (error instanceof NotFoundException) {
                return commonResponse.error(languageCode, res, "TERM_NOT_FOUND", 404, {});
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
