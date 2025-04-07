import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AssessmentService } from "./assessment.service";
import { CreateAssessmentDto } from "./dtos/create-assessment.dto";
import { UpdateAssessmentDto } from "./dtos/update-assessment.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";

@Controller("assessment")
@ApiBearerAuth()
@ApiTags("Assessment")
export class AssessmentController {
    constructor(private readonly assessmentService: AssessmentService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createAssessment(@Body() createAssessmentDto: CreateAssessmentDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const assessment = await this.assessmentService.createAssessment(createAssessmentDto);
            return commonResponse.success(req.headers["language_code"], res, "ASSESSMENT_CREATED", 201, assessment);
        } catch (error) {
            console.log("assessment create", error);
            return commonResponse.error(req.headers["language_code"], res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.PARENTS, ROLE.STUDENT)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getAssessments(@Query() query: any, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const assessments = await this.assessmentService.getAssessments(query);
            if (assessments) {
                return commonResponse.success(languageCode, res, "ASSESSMENTS_FETCHED", 200, assessments);
            } else {
                return commonResponse.error(languageCode, res, "NO_ASSESSMENTS_FOUND", 404, {});
            }
        } catch (error) {
            console.log("assessment list", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get("/:id")
    async getAssessmentById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const assessment = await this.assessmentService.getAssessmentById(id);
            if (assessment) {
                return commonResponse.success(languageCode, res, "ASSESSMENT_FETCHED", 200, assessment);
            } else {
                return commonResponse.error(languageCode, res, "NO_ASSESSMENTS_FOUND", 404, {});
            }
        } catch (error) {
            console.log("assessment list id", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateAssessment(@Param("id") id: number, @Body() updateAssessmentDto: UpdateAssessmentDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.assessmentService.getAssessmentById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "ASSESSMENT_NOT_FOUND", 404, {});
            }

            const updatedAssessment = await this.assessmentService.updateAssessment(id, updateAssessmentDto);
            return commonResponse.success(languageCode, res, "ASSESSMENT_UPDATED", 200, updatedAssessment);
        } catch (error) {
            console.log("assessment update", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteAssessment(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.assessmentService.getAssessmentById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "ASSESSMENT_NOT_FOUND", 404, {});
            }
            await this.assessmentService.deleteAssessment(id);
            return commonResponse.success(languageCode, res, "ASSESSMENT_DELETED", 200, {});
        } catch (error) {
            console.log("assessment delete", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
