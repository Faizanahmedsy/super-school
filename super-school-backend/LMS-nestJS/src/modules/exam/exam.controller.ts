import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards } from "@nestjs/common";
import { ExamService } from "./exam.service";
import * as moment from "moment";
import { CreateExamDto } from "./dtos/create-exam.dto";
import { UpdateExamDto } from "./dtos/update-exam.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("exam")
@ApiBearerAuth()
@ApiTags("Exam")
export class ExamController {
    constructor(private examService: ExamService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createExam(@Body() createExamDto: CreateExamDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const { exam_name, division_id } = createExamDto;

            const checkExist = await this.examService.isExist(exam_name, division_id);
            if (checkExist) {
                return commonResponse.error(languageCode, res, "EXAM_ALREADY_EXISTS_IN_DIVISION", 409, {});
            }

            req.body.start_date_time = moment(`${req.body.start_date} ${req.body.start_time}`, "DD-MM-YYYY HH:mm");
            req.body.end_date_time = moment(`${req.body.end_date} ${req.body.end_time}`, "DD-MM-YYYY HH:mm");

            let newExam = await this.examService.createExam(req.body);
            return commonResponse.success(languageCode, res, "EXAM_CREATED_SUCCESS", 201, newExam);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "exam_name", required: false, type: String, example: "Public exam", description: "Search by exam_name" })
    @ApiQuery({ name: "division_id", required: false, type: Number, example: 1, description: "Filter by division_id" })
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 1, description: "Filter by grade_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    async getExams(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            let exams = await this.examService.getExams(req.query);
            if (exams) {
                return commonResponse.success(languageCode, res, "FETCHED_EXAMS_SUCCESS", 200, exams);
            } else {
                return commonResponse.error(languageCode, res, "NO_EXAMS_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get(":id")
    async getExamById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            let exam = await this.examService.getExamById(id);
            if (exam) {
                return commonResponse.success(languageCode, res, "FETCHED_EXAMS_SUCCESS", 200, exam);
            } else {
                return commonResponse.error(languageCode, res, "EXAM_NOT_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateExam(@Param("id") id: number, @Body() updateExamDto: UpdateExamDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const exam = await this.examService.getExamById(id);
            const { division_id, exam_name } = exam;

            let checkExist = await this.examService.isExist(exam_name, division_id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "EXAM_NOT_FOUND", 404, {});
            }

            let updatedExam = await this.examService.updateExam(id, updateExamDto);
            return commonResponse.success(languageCode, res, "EXAM_UPDATED_SUCCESS", 200, updatedExam);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteExam(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const exam = await this.examService.getExamById(id);
            const { division_id, exam_name } = exam;

            let checkExist = await this.examService.isExist(exam_name, division_id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "EXAM_NOT_FOUND", 404, {});
            }

            await this.examService.deleteExam(id);
            return commonResponse.success(languageCode, res, "EXAM_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
