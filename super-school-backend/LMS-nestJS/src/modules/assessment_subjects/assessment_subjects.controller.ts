import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AssessmentSubjectService } from "./assessment_subjects.service";
import { CreateAssessmentSubjectDto } from "./dtos/create-assessment-subjects.dto";
import { UpdateAssessmentSubjectDto } from "./dtos/update-assessment-subjects.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";

@Controller("assessment-subject")
@ApiBearerAuth()
@ApiTags("Assessment Subject")
export class AssessmentSubjectController {
    constructor(private readonly assessmentSubjectService: AssessmentSubjectService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createAssessmentSubject(@Body() createAssessmentSubjectDto: CreateAssessmentSubjectDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const assessmentSubject = await this.assessmentSubjectService.createAssessmentSubject(createAssessmentSubjectDto);
            return commonResponse.success(languageCode, res, "ASSESSMENT_SUBJECT_CREATED", 201, assessmentSubject);
        } catch (error) {
            console.log("assessment-subject create", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.PARENTS, ROLE.STUDENT)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getAssessmentSubjects(@Query() query: any, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const assessmentSubjects = await this.assessmentSubjectService.getAssessmentSubjects(query);
            if (assessmentSubjects) {
                return commonResponse.success(languageCode, res, "ASSESSMENT_SUBJECTS_FETCHED", 200, assessmentSubjects);
            } else {
                return commonResponse.error(languageCode, res, "NO_ASSESSMENT_SUBJECTS_FOUND", 404, {});
            }
        } catch (error) {
            console.log("assessment-subject list", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get("/:id")
    async getAssessmentSubjectById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const assessmentSubject = await this.assessmentSubjectService.getAssessmentSubjectById(id);
            if (assessmentSubject) {
                return commonResponse.success(languageCode, res, "ASSESSMENT_SUBJECT_FETCHED", 200, assessmentSubject);
            } else {
                return commonResponse.error(languageCode, res, "NO_ASSESSMENT_SUBJECTS_FOUND", 404, {});
            }
        } catch (error) {
            console.log("assessment-subject list id", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateAssessmentSubject(
        @Param("id") id: number,
        @Body() updateAssessmentSubjectDto: UpdateAssessmentSubjectDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.assessmentSubjectService.getAssessmentSubjectById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "ASSESSMENT_SUBJECT_NOT_FOUND", 404, {});
            }

            const updatedAssessmentSubject = await this.assessmentSubjectService.updateAssessmentSubject(id, updateAssessmentSubjectDto);
            return commonResponse.success(languageCode, res, "ASSESSMENT_SUBJECT_UPDATED", 200, updatedAssessmentSubject);
        } catch (error) {
            console.log("assessment-subject update", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteAssessmentSubject(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.assessmentSubjectService.getAssessmentSubjectById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "ASSESSMENT_SUBJECT_NOT_FOUND", 404, {});
            }
            await this.assessmentSubjectService.deleteAssessmentSubject(id);
            return commonResponse.success(languageCode, res, "ASSESSMENT_SUBJECT_DELETED", 200, {});
        } catch (error) {
            console.log("assessment-subject delete", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
