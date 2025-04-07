import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, Query, ParseIntPipe } from "@nestjs/common";
import { InstituteService } from "./institutes.service";
import { CreateInstituteDto } from "../institutes/dtos/create-institutes.dto";
import { UpdateInstituteDto } from "../institutes/dtos/update-institutes.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TeacherService } from "../teacher/teacher.service";
import { StudentService } from "../student/student.service";

@Controller("institute")
@ApiBearerAuth()
@ApiTags("Schools")
export class InstituteController {
    constructor(
        private instituteService: InstituteService,
        private readonly auditLogService: AuditLogService,
        private teacherService: TeacherService,
        private studentService: StudentService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("create")
    async createInstitute(@Body() createInstituteDto: CreateInstituteDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingInstitute = await this.instituteService.isExist({
                EMIS_number: createInstituteDto.EMIS_number,
            });

            if (existingInstitute) {
                return commonResponse.error(languageCode, res, "UNIQUE_EMIS_NUMBER", 409, {});
            }

            createInstituteDto["created_by"] = req.user.userId;
            createInstituteDto["created_by_role"] = req.user.role_name;

            let fetchGeneralSetting = await this.instituteService.findSetting();
            if (fetchGeneralSetting) {
                if (fetchGeneralSetting?.theme_primary_color) {
                    createInstituteDto["themePrimaryColor"] = fetchGeneralSetting.theme_primary_color;
                }
                if (fetchGeneralSetting?.theme_secondary_color) {
                    createInstituteDto["themeSecondaryColor"] = fetchGeneralSetting.theme_secondary_color;
                }
            }

            const newInstitute = await this.instituteService.createInstitute(createInstituteDto);
            await this.auditLogService.create({
                action: "CREATE",
                message: `School ${newInstitute.school_name} created.`,
                old_data: null,
                new_data: newInstitute,
                action_user_id: req.user.userId,

                role_id: req.user.role_id,
                school_id: newInstitute.id,
            });
            return commonResponse.success(languageCode, res, "INSTITUTE_CREATED", 201, newInstitute);
        } catch (error) {
            console.log("🚀 ~ InstituteController ~ createInstitute ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Public school", description: "Search by school_name" })
    @ApiQuery({ name: "province_id", required: false, type: Number, example: 1, description: "Filter by province_id" })
    @ApiQuery({ name: "district_id", required: false, type: Number, example: 1, description: "Filter by district_id" })
    @ApiQuery({ name: "setup", required: false, type: Boolean, example: true, description: "Filter by setup" })
    async getInstitutes(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            query.limit = query.limit ? parseInt(query.limit, 10) : null;
            query.page = query.page ? parseInt(query.page, 10) : null;

            let list = await this.instituteService.getInstitutes(query);

            if (list) {
                return commonResponse.success(languageCode, res, "INSTITUTE_LIST", 200, list);
            } else {
                return commonResponse.error(languageCode, res, "NO_INSTITUTES_FOUND", 404, {});
            }
        } catch (error) {
            console.log("getInstitutesError", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getInstituteById(@Param("id", ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const institute = await this.instituteService.findSchoolForAuth(id);
            if (institute) {
                let teachers = await this.teacherService.getTeacherCountBySchool(institute.id);
                let learners = await this.studentService.getStudentCountBySchool(institute.id);

                institute["teacherCount"] = teachers ? teachers : 0;
                institute["learnerCount"] = learners ? learners : 0;

                institute["province"] = institute.state;
                delete institute.state;
                return commonResponse.success(languageCode, res, "INSTITUTE_DETAILS", 200, institute);
            } else {
                return commonResponse.error(languageCode, res, "NO_INSTITUTES_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    async updateInstitute(@Param("id", ParseIntPipe) id: number, @Body() updateInstituteDto: UpdateInstituteDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            updateInstituteDto["updated_by"] = req.user.userId;

            const checkExist = await this.instituteService.findById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "NO_INSTITUTES_FOUND", 404, {});
            }

            let oldInstitute = { ...checkExist };

            const updatedInstitute = await this.instituteService.updateInstitute(id, updateInstituteDto);
            if (updatedInstitute) {
                const updatedData = this.instituteService.getUpdatedData(oldInstitute, updatedInstitute);
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `School ${updatedInstitute.school_name} updated.`,
                    old_data: updatedData.old,
                    new_data: updatedData.new,
                    action_user_id: req.user.userId,
                    school_id: updatedInstitute.id,

                    role_id: req.user.role_id,
                });

                return commonResponse.success(languageCode, res, "INSTITUTE_UPDATED_SUCCESS", 200, updatedInstitute);
            } else {
                return commonResponse.error(languageCode, res, "UPDATE_FAILED", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    async deleteInstitute(@Param("id", ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];

        try {
            const checkExist = await this.instituteService.isExist({ id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "INSTITUTE_NOT_FOUND", 404, {});
            }
            let oldData = { ...checkExist };
            await this.instituteService.deleteInstitute(id);
            const deletedAt = new Date();

            const auditLogData = {
                action: "DELETE",
                message: `School ${checkExist.school_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                school_id: checkExist.id,

                role_id: req.user.role_id,
                deleted_at: deletedAt,
            };

            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "INSTITUTE_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
